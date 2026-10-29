# Mercado Nativo

Sitio web con una tienda de productos frescos y la hoja de vida de Sebastian Ruiz Segura, desarrollado como proyecto integrador para el Laboratorio de Ingeniería de Software 3.

## Enlaces de entrega

### Segundo parcial: Angular y Spring Boot

La segunda entrega está en [segundo-parcial](segundo-parcial/README.md). Implementa la funcionalidad B: reposición controlada y alertas de stock bajo, con inventario persistente en H2.

Incluye frontend, backend, pruebas HTTP, pruebas automáticas e instrucciones para el video. Se ejecuta localmente con Angular en 4200 y la API en 8081. GitHub Pages mantiene la primera entrega estática; no ejecuta el backend Java.

### Primera entrega

- Repositorio: https://github.com/sebastianrz16/laboratorio-ingenieria-software-3
- Tienda web: https://sebastianrz16.github.io/laboratorio-ingenieria-software-3/
- Hoja de vida: https://sebastianrz16.github.io/laboratorio-ingenieria-software-3/hoja-de-vida.html
- Proyectos: https://sebastianrz16.github.io/laboratorio-ingenieria-software-3/proyectos.html

## Funcionalidades

### Tienda de frutas

- Catálogo generado dinámicamente desde un arreglo de objetos.
- Inventario con estados disponible, últimas unidades y agotado.
- Búsqueda por nombre y filtro por categoría.
- Carrito con cantidades agrupadas y controles para sumar, restar o quitar productos.
- Actualización sincronizada del inventario al modificar el carrito.
- Cálculo de subtotal, descuento, envío y total en pesos colombianos.
- Cupones `DESCUENTO10`, `MITAD` y `ENVIOGRATIS`.
- Formulario de compra y comprobante generado sin recargar la página.
- Modo oscuro guardado en el navegador.
- Aviso de conexión y bloqueo de la confirmación cuando no hay internet.
- Diseño adaptable para computadores, tabletas y teléfonos.

### Hoja de vida y portafolio

- Perfil profesional y datos de contacto.
- Formación académica y experiencia.
- Habilidades técnicas organizadas por áreas.
- Vista previa de proyectos con enlaces a la tienda y a repositorios públicos.
- Página de proyectos con tarjetas y filtros por área.
- Diseño adaptable y versión optimizada para impresión.

## Tecnologías

- HTML5 semántico
- CSS3 con variables, Flexbox, Grid y media queries
- JavaScript moderno y manipulación del DOM
- Git y GitHub

## Estructura

```text
entrega-laboratorio-sw3/
├── assets/
│   └── images/
├── css/
│   ├── cv.css
│   └── styles.css
├── js/
│   ├── app.js
│   └── projects.js
├── hoja-de-vida.html
├── index.html
├── proyectos.html
└── README.md
```

## Ejecución local

Se puede abrir `index.html` directamente en un navegador o utilizar la extensión Live Server de Visual Studio Code.

## Autor

Sebastian Ruiz Segura

Ingeniería de Sistemas, Universidad del Cauca

## Fuente académica

El proyecto toma como referencia la guía y los recursos gráficos proporcionados por el docente. La implementación, organización del código, diseño visual y funcionalidades de esta entrega se desarrollaron en un repositorio propio.
