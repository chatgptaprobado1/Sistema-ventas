# Servidor de ZENYS (backend)

Servidor hecho con Node.js + Express. Guarda el stock y los pedidos, y calcula el precio de cada pedido (la tienda no puede alterarlo).

## Cómo encenderlo (solo en tu PC)

```
cd backend
npm install
npm start
```

Se abre en http://localhost:3000. Prueba en el navegador: http://localhost:3000/api/productos

Luego abre la tienda con **Go Live**. Si el servidor está encendido, la tienda usa su stock y registra los pedidos; si está apagado (o en GitHub Pages), la tienda funciona igual con los datos del catálogo.

## Rutas

| Ruta | Qué hace |
|---|---|
| `GET /api/salud` | Comprueba que el servidor responde |
| `GET /api/productos` | Lista las sillas con precio y stock actual |
| `GET /api/productos/:id` | Una silla |
| `POST /api/pedidos` | Valida datos y stock, descuenta el stock y devuelve `{codigo, total}` |
| `GET /api/pedidos` | Lista los pedidos (requiere el encabezado `x-admin-key`) |

La clave de administrador por defecto es `zenys-admin`; cámbiala con la variable `ADMIN_KEY`.

## Datos

- `data/productos.json`: catálogo inicial (id, nombre, precio, stock, colores). Debe coincidir con `java/script.js`.
- `data/estado.json`: stock actual y pedidos. Se crea solo y no se sube a Git.
