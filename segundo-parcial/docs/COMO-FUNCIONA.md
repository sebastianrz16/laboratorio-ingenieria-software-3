# Cómo funciona la mini tienda

## Objetivo de esta entrega

Mercado Nativo deja de depender de un catálogo guardado únicamente en el navegador. Angular presenta la tienda y Spring Boot aplica las reglas y guarda los productos en H2. La funcionalidad B añade reposición controlada y alertas de stock bajo.

## Las piezas y sus responsabilidades

| Pieza | Responsabilidad |
| --- | --- |
| `mini-tienda/src/app/models/producto.interface.ts` | Describe los datos del producto en TypeScript. Incluye `stockMinimo`. No es una tabla ni guarda datos. |
| `ProductoCardComponent` | Presenta un producto y emite acciones: comprar, reponer y eliminar. Recibe los datos por `input`. |
| `ProductoFormComponent` | Recoge los campos de creación, incluido «Stock mínimo». Emite los datos hacia el componente principal. |
| `AppComponent` | Coordina las acciones, mantiene las señales del catálogo y el carrito, llama a la API y muestra los avisos. |
| `ProductoApi` | Concentra las direcciones y peticiones de `HttpClient`. No modifica la base de datos directamente. |
| `ProductoController` | Expone los endpoints HTTP y delega en el servicio. Valida el cuerpo de las peticiones con `@Valid`. |
| `ProductoService` | Aplica reglas de negocio: existencia del producto, compra sin stock y límites de reposición. |
| `ProductoRepository` | Accede a H2 mediante Spring Data JPA. |
| `Producto` | Entidad Java que JPA convierte en la tabla `PRODUCTOS`. Incluye restricciones de validación. |
| `DatosIniciales` | Carga las cuatro frutas cuando la tabla está vacía. No debe duplicarlas en cada arranque. |
| `ManejadorErrores` | Devuelve mensajes legibles en la forma `{"mensaje":"..."}`. |
| `CorsConfig` | Autoriza la comunicación del navegador desde el origen del frontend configurado. No sustituye autenticación ni validaciones. |

## Recorrido de una reposición

```text
Cantidad en tarjeta + botón Reponer
  → output con id y cantidad
  → AppComponent
  → ProductoApi.reponer / HttpClient POST
  → ProductoController
  → ProductoService: valida cantidad y stock resultante
  → ProductoRepository → H2
  ← producto actualizado en JSON
  ← next de subscribe: reemplaza el producto del catálogo
  ← la tarjeta y el contador se actualizan
```

Si la operación falla, la respuesta no trae un stock nuevo: trae un código HTTP y un `mensaje`. El callback `error` muestra ese mensaje. El inventario no debe cambiar cuando se rechaza una reposición.

## HttpClient y Observable

`HttpClient` es el cliente HTTP de Angular. Por ejemplo, el método `reponer` envía un POST a `/api/productos/3/reponer/5`.

Su respuesta se representa con un `Observable`: el resultado puede llegar más tarde. La suscripción usada aquí tiene dos caminos:

- `next`: llegó un producto válido; el padre lo coloca en la señal del catálogo.
- `error`: el servidor rechazó la petición o hubo un problema de conexión; el padre muestra un aviso.

En este ejercicio no hace falta un estado global adicional para cada llamada. Es importante distinguir «ya se ejecutó la línea que solicita la petición» de «el servidor ya respondió».

## signal y computed

Una señal guarda un estado observable por Angular. Se lee invocándola, por ejemplo `productos()`. Con `.set()` se reemplaza y con `.update()` se calcula un nuevo valor a partir del anterior.

El catálogo cambia cuando responde la API. La pantalla se actualiza al cambiar esa señal, sin crear tarjetas manualmente con `document.getElementById`.

Un `computed` deriva un valor de otras señales. El contador de stock bajo equivale a contar productos que cumplen:

```ts
producto.stock <= producto.stockMinimo
```

Incluye los agotados. El aviso de la tarjeta tiene una condición diferente:

```ts
producto.stock > 0 && producto.stock <= producto.stockMinimo
```

Por eso la Papaya contribuye al contador, pero su tarjeta muestra «Agotado» en lugar de «¡Stock bajo!».

No se cambia el contador a mano después de cada compra o reposición: se actualiza el catálogo, y el valor derivado vuelve a calcularse.

## Reglas y códigos de respuesta

| Situación | Resultado |
| --- | --- |
| Cantidad de reposición entre 1 y 20, sin superar 50 de stock final | 200 y producto actualizado. |
| Cantidad menor que 1 o mayor que 20 | 400: «La cantidad debe estar entre 1 y 20». |
| Stock final mayor que 50 | 409: «El stock no puede superar las 50 unidades». |
| Producto inexistente | 404 y mensaje del servidor. |
| Compra con stock 0 | 409: «Lo sentimos, ya no hay stock». |
| Creación con `stockMinimo` negativo | 400 y mensaje de validación en español. |
| Creación válida | 201 y producto con id asignado por la base de datos. |
| Eliminación válida | 204, sin cuerpo de respuesta. |

400 significa que los datos de la solicitud no cumplen las condiciones. 409 indica que la operación entra en conflicto con el estado actual del producto. 404 indica que el producto pedido no existe.

Las dos reglas de reposición están en `ProductoService`, no únicamente en los controles del formulario. Una persona puede enviar peticiones sin usar nuestra pantalla; el backend debe seguir protegiendo el inventario.

## Qué persiste y qué no

H2 en modo archivo guarda los productos: nombre, precio, stock, imagen y stock mínimo. `ddl-auto=update` permite conservar los datos entre arranques. `DatosIniciales` solo carga las frutas si la tabla está vacía.

El carrito del ejercicio permanece en memoria del frontend. Recargar puede vaciarlo, pero no devuelve las unidades compradas al inventario. El registro de pedidos o un carrito persistente no forma parte de esta funcionalidad.

La consola H2 permite consultar la tabla desde `http://localhost:8081/h2-console`. La URL JDBC del formulario de conexión debe coincidir con la utilizada al arrancar el backend. No publiques esa consola como parte de una aplicación real sin revisar la seguridad.

La guía usa el puerto 8080. Esta entrega usa 8081 porque 8080 está ocupado por otro servicio del equipo; no se detuvo ese servicio. Las rutas y los métodos HTTP no cambian. La configuración del frontend debe coincidir con el puerto del backend.

## Diferencias frente a la primera tienda

| Primera tienda | Segunda entrega |
| --- | --- |
| Catálogo inicial escrito dentro del código del componente. | Catálogo recibido mediante GET desde Spring Boot. |
| Stock descontado solo en una señal del navegador. | Compra y reposición validadas y guardadas por el servidor. |
| Al recargar, el inventario volvía al catálogo inicial. | Las existencias sobreviven a la recarga y al reinicio del backend. |
| El navegador era la única fuente de información. | H2 mantiene los datos; Angular presenta las respuestas del servidor. |
| No había regla de cantidad por reposición ni stock mínimo configurable. | Reposición de 1 a 20, límite de 50 en esa operación y `stockMinimo` por producto. |

El endpoint genérico PUT sigue formando parte del CRUD de la guía. La regla de máximo 50 definida en el enunciado se exige en la nueva operación de reposición; no debe presentarse como una restricción global de todos los posibles usos del CRUD si el código no la impone allí.

## Límites y decisiones del ejercicio

- La API devuelve JSON; las imágenes se sirven como archivos locales del frontend.
- El id lo asigna el backend. No debe dependerse de un id inventado por el formulario.
- Las pestañas no comparten actualizaciones en tiempo real: otra pestaña puede tener un stock desactualizado. El servidor vuelve a comprobarlo al comprar.
- Las pruebas HTTP modifican datos. Para repetir valores exactos, utiliza una base de demostración nueva y separada.
- Lee el README para las versiones y comandos comprobados. Un comando descrito en una guía no demuestra por sí mismo que una prueba haya pasado en este equipo.
