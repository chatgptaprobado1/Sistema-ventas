/* ZENYS - servidor (Node.js + Express): catálogo, stock y pedidos */
const express = require('express');
const fs = require('fs');
const path = require('path');

const PUERTO = process.env.PORT || 3000;
const CLAVE_ADMIN = process.env.ADMIN_KEY || 'zenys-admin';
const ARCHIVO_CATALOGO = path.join(__dirname, 'data', 'productos.json');
const ARCHIVO_ESTADO = path.join(__dirname, 'data', 'estado.json');   // se crea solo; no se sube a Git
const PAGOS = ['Yape / Plin', 'Transferencia', 'Contra entrega'];
const TAMANOS = ['Estándar', 'XL'];
const EXTRA_XL = 100;

const catalogo = JSON.parse(fs.readFileSync(ARCHIVO_CATALOGO, 'utf8'));
const buscar = id => catalogo.find(p => p.id === Number(id));
const colores = p => p.colors.split(',').map(c => c.split(':')[0].trim());

/* ---- "Base de datos" en un archivo JSON: stock actual y pedidos ---- */
function leerEstado() {
  try { return JSON.parse(fs.readFileSync(ARCHIVO_ESTADO, 'utf8')); }
  catch { return { stock: {}, pedidos: [] }; }
}
function guardarEstado(estado) {
  const temporal = ARCHIVO_ESTADO + '.tmp';
  fs.writeFileSync(temporal, JSON.stringify(estado, null, 2));
  fs.renameSync(temporal, ARCHIVO_ESTADO);          // reemplaza de una vez para no dejar el archivo a medias
}
const stockDe = (p, estado) => estado.stock[p.id] ?? p.stock;
const publico = (p, estado) => ({ id: p.id, name: p.name, cat: p.cat, price: p.price, stock: stockDe(p, estado) });

/* ---- Validación de los datos del cliente (mismas reglas que la tienda) ---- */
function limpiarCliente(c, pago) {
  if (!c || typeof c !== 'object') return { error: 'Faltan los datos del cliente' };
  const nombre = String(c.nombre ?? '').trim(), direccion = String(c.direccion ?? '').trim();
  const celular = String(c.celular ?? '').replace(/[\s-]/g, '');
  if (nombre.length < 5 || nombre.split(/\s+/).length < 2) return { error: 'Escribe tu nombre y apellido' };
  if (!/^9\d{8}$/.test(celular)) return { error: 'El celular debe tener 9 dígitos y empezar con 9' };
  if (direccion.length < 10) return { error: 'Escribe una dirección más completa' };
  if (!PAGOS.includes(pago)) return { error: 'Forma de pago no válida' };
  return { cliente: { nombre, celular, direccion } };
}

const app = express();
app.use((req, res, next) => {
  res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-admin-key', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '50kb' }));

app.get('/api/salud', (req, res) => res.json({ ok: true }));

app.get('/api/productos', (req, res) => {
  const estado = leerEstado();
  res.json(catalogo.map(p => publico(p, estado)));
});

app.get('/api/productos/:id', (req, res) => {
  const p = buscar(req.params.id);
  if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(publico(p, leerEstado()));
});

app.post('/api/pedidos', (req, res) => {
  const { cliente, pago, items } = req.body || {};
  const limpio = limpiarCliente(cliente, pago);
  if (limpio.error) return res.status(400).json({ error: limpio.error });
  if (!Array.isArray(items) || !items.length || items.length > 20) return res.status(400).json({ error: 'El carrito está vacío o es demasiado grande' });

  const estado = leerEstado(), pedidas = {}, lineas = [];
  for (const it of items) {
    const p = buscar(it?.id), qty = Number(it?.qty);
    if (!p) return res.status(400).json({ error: 'Una de las sillas ya no existe' });
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) return res.status(400).json({ error: 'Cantidad no válida' });
    if (!colores(p).includes(it.color)) return res.status(400).json({ error: `Color no válido para ${p.name}` });
    if (!TAMANOS.includes(it.size)) return res.status(400).json({ error: 'Tamaño no válido' });
    const precio = p.price + (it.size === 'XL' ? EXTRA_XL : 0);          // el precio SIEMPRE lo calcula el servidor
    pedidas[p.id] = (pedidas[p.id] || 0) + qty;
    lineas.push({ id: p.id, nombre: p.name, color: it.color, tamano: it.size, qty, precio, subtotal: precio * qty });
  }
  for (const id of Object.keys(pedidas)) {
    const p = buscar(id), disponible = stockDe(p, estado);
    if (pedidas[id] > disponible) return res.status(409).json({ error: disponible > 0 ? `Solo quedan ${disponible} unidades de ${p.name}` : `${p.name} está agotada` });
  }
  Object.keys(pedidas).forEach(id => { estado.stock[id] = stockDe(buscar(id), estado) - pedidas[id]; });
  const total = lineas.reduce((s, l) => s + l.subtotal, 0);
  const codigo = 'ZEN-' + String(estado.pedidos.length + 1).padStart(4, '0');
  estado.pedidos.push({ codigo, fecha: new Date().toISOString(), cliente: limpio.cliente, pago, items: lineas, total });
  guardarEstado(estado);
  res.status(201).json({ codigo, total });
});

app.get('/api/pedidos', (req, res) => {
  if (req.get('x-admin-key') !== CLAVE_ADMIN) return res.status(401).json({ error: 'No autorizado' });
  res.json(leerEstado().pedidos);
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => res.status(400).json({ error: 'Solicitud no válida' }));

app.listen(PUERTO, () => console.log(`Servidor ZENYS en http://localhost:${PUERTO}  (prueba: /api/productos)`));
