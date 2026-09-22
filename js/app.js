"use strict";

const productos = [
  { id: 1, nombre: "Manzana roja", categoria: "Fruta", precio: 4200, stock: 10, unidad: "Bolsa de 1 kg", imagen: "assets/images/manzana.jpg" },
  { id: 2, nombre: "Piña dorada", categoria: "Fruta", precio: 6800, stock: 5, unidad: "Unidad", imagen: "assets/images/pina.jpg" },
  { id: 3, nombre: "Pera nacional", categoria: "Fruta", precio: 5600, stock: 8, unidad: "Bolsa de 1 kg", imagen: "assets/images/pera.jpg" },
  { id: 4, nombre: "Mango maduro", categoria: "Fruta", precio: 4900, stock: 3, unidad: "Bolsa de 1 kg", imagen: "assets/images/mango.jpg" },
  { id: 5, nombre: "Fresa fresca", categoria: "Fruta", precio: 7500, stock: 0, unidad: "Bandeja de 500 g", imagen: "assets/images/fresa.jpg" },
  { id: 6, nombre: "Sandía", categoria: "Fruta", precio: 9800, stock: 4, unidad: "Unidad", imagen: "assets/images/sandia.jpg" },
  { id: 7, nombre: "Zanahoria", categoria: "Verdura", precio: 3200, stock: 12, unidad: "Bolsa de 1 kg", imagen: "assets/images/zanahoria.jpg" },
  { id: 8, nombre: "Brócoli", categoria: "Verdura", precio: 4600, stock: 2, unidad: "Unidad", imagen: "assets/images/brocoli.jpg" },
  { id: 9, nombre: "Lechuga crespa", categoria: "Verdura", precio: 2800, stock: 7, unidad: "Unidad", imagen: "assets/images/lechuga.jpg" },
  { id: 10, nombre: "Tomate chonto", categoria: "Verdura", precio: 3900, stock: 0, unidad: "Bolsa de 1 kg", imagen: "assets/images/tomate.jpg" },
  { id: 11, nombre: "Limonada natural", categoria: "Bebida", precio: 5200, stock: 6, unidad: "Botella de 500 ml", imagen: "assets/images/limonada.jpg" },
  { id: 12, nombre: "Agua de coco", categoria: "Bebida", precio: 6500, stock: 3, unidad: "Botella de 500 ml", imagen: "assets/images/aguaCoco.jpg" }
];

const listaProductos = document.getElementById("lista-productos");
const totalProductos = document.getElementById("total-productos");
const unidadesDisponibles = document.getElementById("unidades-disponibles");
const contadorCarrito = document.getElementById("contador-carrito");
const cartBadge = document.getElementById("cart-badge");
const itemsCarrito = document.getElementById("items-carrito");
const textoSubtotal = document.getElementById("texto-subtotal");
const textoEnvio = document.getElementById("texto-envio");
const textoTotal = document.getElementById("texto-total");
const mensajeSistema = document.getElementById("mensaje-sistema");

const COSTO_ENVIO = 7000;
const MINIMO_ENVIO_GRATIS = 60000;

let carrito = [];
let temporizadorMensaje;

const formatearPrecio = (valor) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
}).format(valor);

function obtenerEstadoStock(stock) {
  if (stock === 0) {
    return { texto: "Agotado", clase: "out" };
  }

  if (stock <= 3) {
    return { texto: `Últimas ${stock} unidades`, clase: "low" };
  }

  return { texto: `${stock} disponibles`, clase: "" };
}

function buscarProducto(idProducto) {
  return productos.find((producto) => producto.id === idProducto);
}

function mostrarMensaje(texto, tipo = "exito") {
  window.clearTimeout(temporizadorMensaje);
  mensajeSistema.textContent = texto;
  mensajeSistema.className = tipo === "error" ? "toast error" : "toast";
  mensajeSistema.hidden = false;

  temporizadorMensaje = window.setTimeout(() => {
    mensajeSistema.hidden = true;
  }, 3000);
}

function buscarItemCarrito(idProducto) {
  return carrito.find((item) => item.id === idProducto);
}

function agregarAlCarrito(idProducto) {
  const producto = buscarProducto(idProducto);

  if (!producto || producto.stock === 0) {
    mostrarMensaje("Este producto ya no tiene unidades disponibles.", "error");
    return;
  }

  const itemExistente = buscarItemCarrito(idProducto);

  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1
    });
  }

  producto.stock -= 1;
  mostrarMensaje(`${producto.nombre} se agregó al carrito.`);
  actualizarPantalla();
}

function cambiarCantidad(idProducto, cambio) {
  const item = buscarItemCarrito(idProducto);
  const producto = buscarProducto(idProducto);

  if (!item || !producto) {
    return;
  }

  if (cambio > 0) {
    if (producto.stock === 0) {
      mostrarMensaje("No quedan más unidades disponibles.", "error");
      return;
    }

    item.cantidad += 1;
    producto.stock -= 1;
  } else {
    item.cantidad -= 1;
    producto.stock += 1;

    if (item.cantidad === 0) {
      carrito = carrito.filter((linea) => linea.id !== idProducto);
    }
  }

  actualizarPantalla();
}

function quitarDelCarrito(idProducto) {
  const item = buscarItemCarrito(idProducto);
  const producto = buscarProducto(idProducto);

  if (!item || !producto) {
    return;
  }

  producto.stock += item.cantidad;
  carrito = carrito.filter((linea) => linea.id !== idProducto);
  mostrarMensaje(`${producto.nombre} se retiró del carrito.`);
  actualizarPantalla();
}

function actualizarIndicadores() {
  totalProductos.textContent = String(productos.length);
  unidadesDisponibles.textContent = String(
    productos.reduce((total, producto) => total + producto.stock, 0)
  );
}

function crearTarjetaProducto(producto) {
  const estado = obtenerEstadoStock(producto.stock);
  const tarjeta = document.createElement("article");
  tarjeta.className = `product-card${producto.stock === 0 ? " is-out" : ""}`;

  tarjeta.innerHTML = `
    <div class="product-media">
      <img src="${producto.imagen}" alt="${producto.nombre}" width="640" height="480">
      <span class="stock-pill ${estado.clase}">${estado.texto}</span>
    </div>
    <div class="product-body">
      <p class="product-category">${producto.categoria}</p>
      <h2>${producto.nombre}</h2>
      <p class="product-unit">${producto.unidad}</p>
      <div class="product-bottom">
        <span class="product-price">${formatearPrecio(producto.precio)}</span>
        <button class="product-button" type="button" ${producto.stock === 0 ? "disabled" : ""}>
          ${producto.stock === 0 ? "Sin existencias" : "Comprar"}
        </button>
      </div>
    </div>
  `;

  const boton = tarjeta.querySelector("button");
  boton.addEventListener("click", () => agregarAlCarrito(producto.id));
  return tarjeta;
}

function renderizarProductos() {
  listaProductos.replaceChildren(...productos.map(crearTarjetaProducto));
  actualizarIndicadores();
}

function crearLineaCarrito(item) {
  const linea = document.createElement("article");
  linea.className = "cart-item";
  linea.innerHTML = `
    <img src="${item.imagen}" alt="" width="96" height="96">
    <div class="cart-item-main">
      <div class="cart-item-top">
        <h3>${item.nombre}</h3>
        <button class="remove-button" type="button" aria-label="Quitar ${item.nombre} del carrito">Quitar</button>
      </div>
      <div class="cart-item-bottom">
        <div class="quantity-controls" aria-label="Cantidad de ${item.nombre}">
          <button class="cart-control decrease" type="button" aria-label="Restar una unidad">−</button>
          <strong aria-label="${item.cantidad} unidades">${item.cantidad}</strong>
          <button class="cart-control increase" type="button" aria-label="Sumar una unidad">+</button>
        </div>
        <span class="cart-item-price">${formatearPrecio(item.precio * item.cantidad)}</span>
      </div>
    </div>
  `;

  linea.querySelector(".decrease").addEventListener("click", () => cambiarCantidad(item.id, -1));
  linea.querySelector(".increase").addEventListener("click", () => cambiarCantidad(item.id, 1));
  linea.querySelector(".remove-button").addEventListener("click", () => quitarDelCarrito(item.id));
  return linea;
}

function calcularTotales() {
  const subtotal = carrito.reduce(
    (acumulado, item) => acumulado + item.precio * item.cantidad,
    0
  );
  const envio = subtotal === 0 || subtotal >= MINIMO_ENVIO_GRATIS ? 0 : COSTO_ENVIO;

  return {
    subtotal,
    envio,
    total: subtotal + envio
  };
}

function renderizarCarrito() {
  if (carrito.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "cart-empty";
    vacio.textContent = "Tu carrito está vacío. Agrega un producto para comenzar.";
    itemsCarrito.replaceChildren(vacio);
  } else {
    itemsCarrito.replaceChildren(...carrito.map(crearLineaCarrito));
  }

  const unidades = carrito.reduce((total, item) => total + item.cantidad, 0);
  const totales = calcularTotales();

  contadorCarrito.textContent = String(unidades);
  cartBadge.textContent = String(unidades);
  textoSubtotal.textContent = formatearPrecio(totales.subtotal);
  textoEnvio.textContent = totales.envio === 0 ? "Gratis" : formatearPrecio(totales.envio);
  textoTotal.textContent = formatearPrecio(totales.total);
}

function actualizarPantalla() {
  renderizarProductos();
  renderizarCarrito();
}

(function iniciarTienda() {
  actualizarPantalla();
})();
