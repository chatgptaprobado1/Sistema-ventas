/* ZENYS - tienda de una sola página (rutas: #/tienda, #/producto/ID, #/carrito) */
const WA  = '51936842953';        // <- tu número de WhatsApp con código de país
const IMG = '../imagenes/';        // <- carpeta donde pones las fotos de las sillas

/* CATÁLOGO: para poner tus fotos, copia los archivos a la carpeta "imagenes"
   y escribe sus nombres en "images". Si no hay foto, se muestra el dibujo. */
const products = [
  {id:1,name:'Zenyx Shadow Dragon',serie:'Serie Shadow Dragon',cat:'Dragón',price:1590,stock:6,colors:'Negro y morado:#2a1f3d,Gris grafito:#3a3a42',images:['zenyx_dragon_ultimate.jpg'],
   desc:'Serie Shadow Dragon Advanced. Tela y cuero sintético, logo ZD con luz, dragón bordado en el respaldo y reposabrazos 4D.'},
  {id:2,name:'Zenyx Dragon Lord',serie:'Serie Dragon Lord',cat:'Dragón',price:1490,stock:8,colors:'Negro:#1b1b22,Morado:#4a3a6b',images:['zenyx_dragon.jpg'],
   desc:'Serie Dragon Lord Anime. Cuero sintético negro, emblema luminoso y alas bordadas en los laterales del respaldo.'},
  {id:3,name:'Zenyx Naruto Uzumaki',serie:'Edición Hokage Ascendant',cat:'Anime',price:1450,stock:7,colors:'Naranja y azul:#e07a2c,Azul marino:#2c5f9e',images:['zenyx_naruto.jpg'],
   desc:'Edición clan Uzumaki. Cuero sintético naranja con detalles azules, emblema de la hoja en el cabezal y arte Sage Art en el respaldo.'},
  {id:4,name:'Zenyx Upper Moon',serie:'Edición Kokushibo',cat:'Anime',price:1590,stock:5,colors:'Negro y rojo:#1b1b22,Rojo sangre:#8a1c1c',images:['upper_moon.jpg'],
   desc:'Edición Luna Superior. Respaldo con arte bordado en rojo sangre, máscara oni en el cabezal y base reforzada para sesiones largas.'},
  {id:5,name:'Zenyx Light Yagami',serie:'Edición Death Note',cat:'Anime',price:1490,stock:6,colors:'Negro:#1b1b22,Rojo:#a3262a',images:['light_yagami.jpg'],
   desc:'Edición Kira. Cuero sintético negro con costuras rojas, emblema L en el cabezal e iluminación roja inferior.'},
  {id:6,name:'Zenyx Ken Kaneki',serie:'Edición Tokyo Ghoul',cat:'Anime',price:1490,stock:4,colors:'Negro y blanco:#1b1b22,Blanco:#eeeeee',images:['ken_kaneki.jpg'],
   desc:'Edición Ghoul. Combinación blanco y negro, respaldo con arte de Kaneki y reposabrazos 4D ajustables.'},
  {id:7,name:'Zenyx Blue Lock',serie:'Edición Isagi Yoichi',cat:'Anime',price:1390,stock:8,colors:'Azul y negro:#1c3f7a,Celeste:#4fa3d9',images:['blue_lock.jpg'],
   desc:'Edición Blue Lock Project. Acabado azul eléctrico, respaldo con arte de Isagi y cojín cervical incluido.'},
  {id:8,name:'Zenyx Elite Class',serie:'Edición Classroom of the Elite',cat:'Anime',price:1390,stock:6,colors:'Rojo vino:#6b1f2a,Blanco:#f1ece6',images:['elite_class.jpg'],
   desc:'Edición Elite Class. Tapizado rojo vino con insignia en el cabezal y respaldo ergonómico reclinable.'}
];

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => 'S/ ' + Number(n).toLocaleString('es-PE');
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
let cart = load('zenys-cart', []);
const saveCart = () => { try { localStorage.setItem('zenys-cart', JSON.stringify(cart)) } catch {} };

const col = p => p.colors.split(',').map(x => x.split(':')).filter(a => a[1]).map(([n,h]) => ({n:n.trim(), h:h.trim()}));
const chairSvg = p => `<svg role="img" aria-label="${esc(p.name)}" style="--a:${esc(col(p)[0].h)};--b:${esc((col(p)[1]||col(p)[0]).h)}"><use href="#chair"/></svg>`;
const chairById = id => chairSvg(products.find(p => p.id == id));
const art = (p, i = 0) => p.images[i]
  ? `<img src="${IMG}${esc(p.images[i])}" alt="${esc(p.name)}" loading="lazy" onerror="this.outerHTML=chairById(${p.id})">`
  : chairSvg(p);
const unit = (p, size) => p.price + (size === 'XL' ? 100 : 0);
const lines = () => cart.map(i => ({...i, p: products.find(x => x.id == i.id)})).filter(l => l.p);
const count = () => $('#count').textContent = cart.reduce((s, i) => s + i.qty, 0);

function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2000) }

const card = p => `<article class="card">${p.stock < 1 ? '<span class="tag">Agotado</span>' : ''}
  <a href="#/producto/${p.id}"><div class="art">${art(p)}</div><h3>${esc(p.name)}</h3></a>
  <p class="clan">${esc(p.serie)}</p><p class="price">${money(p.price)}</p>
  <a class="btn dark" href="#/producto/${p.id}">Ver y elegir</a></article>`;

function addCart(id, color, size, qty){
  const p = products.find(x => x.id == id), k = `${id}|${color}|${size}`, it = cart.find(x => x.k === k);
  if ((it ? it.qty : 0) + qty > p.stock) { toast('Solo quedan ' + p.stock + ' unidades'); return false }
  it ? it.qty += qty : cart.push({k, id:p.id, color, size, qty});
  saveCart(); count(); return true;
}

/* ---------- Inicio ---------- */
function home(){
  $('#app').innerHTML = `
  <section class="hero"><div><h1>El trono de tu próxima batalla</h1>
    <p>Sillas gamer con ergonomía real y ediciones inspiradas en el anime. Diseñadas para sesiones largas, enviadas a todo el Perú.</p>
    <a class="btn" href="#/tienda">Ir a la tienda</a></div>
    <div class="hero-logo"><img src="${IMG}logo.png" alt="Logo de ZENYS"></div></section>
  <section class="paper edge"><div class="wrap"><h2>Ediciones destacadas</h2><p class="lead">Cada silla lleva el emblema de un clan. Elige el tuyo.</p>
    <div class="grid">${products.map(card).join('')}</div>
    <a class="btn dark" href="#/tienda">Ver toda la tienda</a></div></section>
  <section class="quality"><h2>Hechas para aguantar</h2><ul>
    <li><strong>Tela transpirable</strong> que no se pega en verano.</li>
    <li><strong>Espuma de alta densidad</strong> que no se aplasta con los meses.</li>
    <li><strong>Reposabrazos 4D</strong> que se ajustan en altura, giro y profundidad.</li>
    <li><strong>Garantía de 2 años</strong> en estructura y pistón.</li></ul></section>`;
}

/* ---------- Tienda con filtros ---------- */
function tienda(){
  const cats = ['Todas', ...new Set(products.map(p => p.cat))];
  const top = Math.ceil(Math.max(...products.map(p => p.price), 500) / 100) * 100;
  let cat = 'Todas';
  $('#app').innerHTML = `<section class="paper page"><div class="wrap"><h2>Tienda</h2>
  <div class="filters"><label>Buscar<input id="q" type="search" placeholder="Nombre de la silla"></label>
   <label>Ordenar<select id="so"><option value="">Destacadas</option><option value="a">Precio: menor a mayor</option><option value="d">Precio: mayor a menor</option></select></label>
   <label>Precio hasta <b id="mv">${money(top)}</b><input id="mx" type="range" min="0" max="${top}" step="50" value="${top}"></label></div>
  <div class="chips">${cats.map(c => `<button class="chip${c === 'Todas' ? ' on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="grid" id="list"></div></div></section>`;
  const draw = () => {
    const q = $('#q').value.toLowerCase(), mx = +$('#mx').value, so = $('#so').value;
    $('#mv').textContent = money(mx);
    const r = products.filter(p => (cat === 'Todas' || p.cat === cat) && p.price <= mx && p.name.toLowerCase().includes(q));
    if (so) r.sort((a, b) => so === 'a' ? a.price - b.price : b.price - a.price);
    $('#list').innerHTML = r.length ? r.map(card).join('') : '<p>No hay sillas con esos filtros. Prueba ampliando el precio o cambiando la categoría.</p>';
  };
  ['q','so','mx'].forEach(i => $('#' + i).oninput = draw);
  document.querySelectorAll('.chip').forEach(b => b.onclick = () => { cat = b.dataset.cat; document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); draw() });
  draw();
}

/* ---------- Detalle de producto ---------- */
function producto(id){
  const p = products.find(x => x.id == id); if (!p) return tienda();
  const cs = col(p); let color = cs[0].n;
  $('#app').innerHTML = `<section class="paper page"><div class="wrap"><a href="#/tienda">‹ Volver a la tienda</a><div class="prod">
  <div><div class="main" id="main">${art(p, 0)}</div>
   <div class="thumbs">${p.images.length > 1 ? p.images.map((s, i) => `<button class="thumb" data-i="${i}" aria-label="Foto ${i + 1}"><img src="${IMG}${esc(s)}" alt=""></button>`).join('') : ''}</div></div>
  <div><h2>${esc(p.name)}</h2><p class="clan">${esc(p.serie)}</p><p class="price big" id="pr">${money(p.price)}</p><p>${esc(p.desc)}</p>
   <p class="lbl">Color: <b id="cn">${esc(color)}</b></p>
   <div>${cs.map((c, i) => `<button class="sw${i ? '' : ' on'}" data-c="${esc(c.n)}" style="--c:${esc(c.h)}" aria-label="${esc(c.n)}"></button>`).join('')}</div>
   <div class="row2"><label>Tamaño<select id="sz"><option>Estándar</option><option value="XL">XL (+S/ 100)</option></select></label>
   <label>Cantidad<input id="qt" type="number" min="1" value="1"></label></div>
   <p class="hint">${p.stock > 0 ? p.stock + ' disponibles' : 'Agotado por ahora'}</p>
   <div class="acts"><button class="btn dark" id="add" ${p.stock < 1 ? 'disabled' : ''}>Agregar al carrito</button>
   <button class="btn" id="buy" ${p.stock < 1 ? 'disabled' : ''}>Comprar ahora</button></div></div></div></div></section>`;
  document.querySelectorAll('.sw').forEach(b => b.onclick = () => { color = b.dataset.c; $('#cn').textContent = color; document.querySelectorAll('.sw').forEach(x => x.classList.toggle('on', x === b)) });
  document.querySelectorAll('.thumb').forEach(b => b.onclick = () => $('#main').innerHTML = art(p, +b.dataset.i));
  $('#sz').onchange = () => $('#pr').textContent = money(unit(p, $('#sz').value));
  const add = () => addCart(p.id, color, $('#sz').value, Math.max(1, +$('#qt').value || 1));
  $('#add').onclick = () => add() && toast('Agregada al carrito');
  $('#buy').onclick = () => add() && (location.hash = '#/carrito');
}

/* ---------- Carrito y pedido ---------- */
function carrito(done){
  if (done) return $('#app').innerHTML = `<section class="paper page"><div class="wrap narrow"><h2>¡Pedido enviado!</h2>
    <p>Tu pedido <b>${done}</b> está listo. Si WhatsApp no se abrió, revisa que tu navegador permita ventanas emergentes y vuelve a intentarlo.</p><br>
    <a class="btn dark" href="#/tienda">Seguir comprando</a></div></section>`;
  const ls = lines(), total = ls.reduce((s, l) => s + unit(l.p, l.size) * l.qty, 0);
  $('#app').innerHTML = `<section class="paper page"><div class="wrap"><h2>Tu carrito</h2>${!ls.length ?
  '<p>Aún no agregaste ninguna silla.</p><br><a class="btn dark" href="#/tienda">Ir a la tienda</a>' : `
  <div class="cartgrid"><div class="scroll"><table><tr><th></th><th>Silla</th><th>Cant.</th><th>Subtotal</th><th></th></tr>
  ${ls.map(l => `<tr><td><div class="mini-svg">${art(l.p)}</div></td>
   <td><b>${esc(l.p.name)}</b><br><small>${esc(l.color)} · ${esc(l.size)} · ${money(unit(l.p, l.size))}</small></td>
   <td><button class="sm" data-k="${esc(l.k)}" data-d="-1" aria-label="Quitar uno">−</button> ${l.qty} <button class="sm" data-k="${esc(l.k)}" data-d="1" aria-label="Agregar uno">+</button></td>
   <td>${money(unit(l.p, l.size) * l.qty)}</td><td><button class="sm danger" data-k="${esc(l.k)}" data-d="0">Quitar</button></td></tr>`).join('')}</table></div>
  <form class="box form" id="ck"><h3>Datos de entrega</h3>
   <label>Nombre completo<input id="nm" required></label>
   <label>Celular<input id="ph" type="tel" required></label>
   <label>Dirección y ciudad<input id="ad" required></label>
   <label>Forma de pago<select id="py"><option>Yape / Plin</option><option>Transferencia</option><option>Contra entrega</option></select></label>
   <p class="total"><span>Total</span><b>${money(total)}</b></p>
   <button class="btn dark">Enviar pedido por WhatsApp</button></form></div>`}</div></section>`;
  document.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    const it = cart.find(x => x.k === b.dataset.k), d = +b.dataset.d, p = products.find(x => x.id == it.id);
    if (d === 0) cart = cart.filter(x => x !== it);
    else if (d > 0 && it.qty >= p.stock) return toast('Solo quedan ' + p.stock + ' unidades');
    else { it.qty += d; if (it.qty < 1) cart = cart.filter(x => x !== it) }
    saveCart(); count(); carrito();
  });
  if ($('#ck')) $('#ck').onsubmit = e => {
    e.preventDefault();
    const code = 'Z' + Date.now().toString().slice(-6);
    const items = ls.map(l => `${l.qty} x ${l.p.name} (${l.color}, ${l.size})`).join(', ');
    const msg = `Hola ZENYS, soy ${$('#nm').value}. Pedido ${code}: ${items}. Total ${money(total)}. Pago: ${$('#py').value}. Dirección: ${$('#ad').value}. Cel: ${$('#ph').value}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
    cart = []; saveCart(); count(); carrito(code);
  };
}

/* ---------- Router ---------- */
function route(){
  const [v, a] = location.hash.replace('#/', '').split('/');
  ({tienda, producto, carrito}[v] || home)(a);
  scrollTo(0, 0); count();
}
addEventListener('hashchange', route);
route();