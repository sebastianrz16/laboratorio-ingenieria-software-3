# Guía para el video del segundo parcial

Duración sugerida: entre 8 y 9 minutos. Límite de la entrega: 10 minutos.

Esta guía sirve para preparar la explicación; no es necesario leerla literalmente. Explica únicamente lo que comprendas y muestra los resultados reales de tu ejecución.

## Antes de grabar

1. Lee el README principal y comprueba los requisitos de Java y Node. Abre la carpeta completa del proyecto en VS Code: contiene `tienda-api` y `mini-tienda`.
2. Arranca los dos programas en terminales separadas. El backend atiende en `http://localhost:8081` y el frontend en `http://localhost:4200`. El puerto 8080 de este equipo está ocupado por otro servicio: no lo detengas. Solo cambia el puerto frente al ejemplo de la guía; las rutas `/api/productos` son las mismas.
3. Usa una base separada para el video para no alterar datos de otros trabajos. Desde `tienda-api`, puedes indicar una ubicación nueva al arrancar:

   ```powershell
   .\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.datasource.url=jdbc:h2:file:./data/video-toma-01"
   ```

   La primera vez, ese archivo debe ser nuevo: se cargarán las cuatro frutas. Para otra toma, cambia `video-toma-01` por otro nombre que aún no exista. No hace falta borrar bases anteriores. Para demostrar persistencia, reinicia usando exactamente el mismo nombre de archivo.

4. Confirma los valores iniciales: Manzana 3, Piña 5, Pera 2, Papaya 0; `stockMinimo` vale 2 y el contador indica 2. Si no coinciden, no empieces la secuencia como si fueran datos iniciales.
5. Abre `tienda-api/pruebas.http` y la extensión REST Client. Las pruebas modifican existencias: lee sus comentarios antes de enviarlas. Las ocho pruebas base y la sección B deben ejecutarse con sus respectivos datos iniciales, no una después de otra sobre un inventario ya alterado.
6. Prepara estas pestañas: tienda, consola H2 y herramientas del navegador, sección Network/Red. Cierra pestañas con información personal.
7. Ensaya una vez con cronómetro. Si una prueba no funciona, corrígela antes de grabar; no simules una respuesta.

## 0:00–0:35 — Presentación

> Presento la segunda entrega de la mini tienda Mercado Nativo. La aplicación tiene un frontend en Angular y una API en Spring Boot. La funcionalidad elegida es la B: reposición controlada y alerta de stock bajo. Permite elegir cuántas unidades reponer y el servidor valida los límites.

Muestra las carpetas `mini-tienda` y `tienda-api`. No dediques tiempo a recorrer todas las dependencias.

## 0:35–1:20 — Arquitectura y punto de partida

> El componente muestra los productos y recibe acciones de las tarjetas. El servicio ProductoApi envía las peticiones HTTP. El controlador Java recibe esas peticiones, ProductoService aplica las reglas y el repositorio guarda los datos en H2. Angular nunca consulta la base de datos directamente.

Señala las dos terminales y los puertos. En la tienda muestra las cuatro frutas y el contador inicial de 2. Explica que Pera y Papaya cuentan: el contador incluye productos agotados, aunque el aviso de la tarjeta distingue entre «Stock bajo» y «Agotado».

## 1:20–2:10 — Modelo y reglas de negocio

Abre `Producto.java` y `ProductoService.java`.

> El atributo nuevo es stockMinimo. Es un Integer en Java y un number en Angular, se inicia en 2 y no permite negativos. La reposición acepta de 1 a 20 unidades por petición. Si la cantidad está fuera de ese rango, el servidor responde 400. Si la suma dejaría más de 50 unidades, responde 409 y no cambia el inventario.

Señala el método `reponer` y el endpoint `POST /api/productos/{id}/reponer/{cantidad}`. Menciona que buscar un producto inexistente responde 404.

## 2:10–3:15 — B1: reposición válida desde la tarjeta

1. En Pera, introduce 5 y pulsa «Reponer».
2. La tarjeta debe pasar de stock 2 a 7 sin recargar.
3. Debe desaparecer «¡Stock bajo!» y el contador debe pasar de 2 a 1.
4. En Network, muestra el POST a `/api/productos/3/reponer/5`, código 200 y la respuesta con `stock: 7`.

> Este es el escenario B1. La pantalla no suma cinco por su cuenta: reemplaza el producto con el objeto que devuelve la API. Por eso el stock mostrado coincide con el que quedó guardado.

No vuelvas a enviar B1 desde `pruebas.http` esperando 7: si lo repites, la suma vuelve a aplicarse. El archivo permite reproducir el escenario desde datos iniciales.

## 3:15–3:50 — B2: cantidad inválida y mensaje del servidor

En Piña introduce 30 y pulsa «Reponer».

Resultado esperado: HTTP 400 y el aviso «La cantidad debe estar entre 1 y 20». El stock de Piña debe seguir en 5.

> La validación importante está en Java. Aunque una petición llegue desde otra pestaña o desde REST Client, las reglas siguen aplicándose. El frontend muestra el mensaje recibido en la propiedad mensaje.

## 3:50–4:50 — B3: límite máximo de inventario

En `pruebas.http`, ejecuta las tres peticiones del escenario B3 sobre Piña. Hasta aquí su stock debe seguir en 5:

1. Reponer 20: 200, stock 25.
2. Reponer 20 otra vez: 200, stock 45.
3. Reponer 20 por tercera vez: 409, «El stock no puede superar las 50 unidades».

Consulta Piña con GET para confirmar que quedó en 45, no en 65. Si luego vuelves a la tienda, solicita una nueva carga del catálogo o recarga la página: los cambios hechos desde un cliente HTTP externo no se transmiten automáticamente al navegador.

## 4:50–5:30 — B4: validación del nuevo atributo

Ejecuta la creación de un producto con `stockMinimo: -1` desde `pruebas.http`.

Resultado esperado: 400, mensaje de validación en español y ningún producto nuevo creado.

> La misma propiedad existe en la entidad y en la interfaz. El valor por defecto se usa cuando no se proporciona; si se envía un valor negativo, la validación lo rechaza.

Muestra brevemente el campo «Stock mínimo» del formulario, con valor inicial 2. Si haces una creación válida de ejemplo, utiliza un nombre reconocible y comprueba que aparece sin recargar.

## 5:30–6:25 — Alertas y persistencia

1. Compra una Manzana: pasa de 3 a 2. Debe aparecer «¡Stock bajo!» y aumentar el contador.
2. Recarga la página: el stock debe mantenerse. El carrito puede vaciarse, porque el ejercicio conserva el carrito en memoria, no en la base de datos.
3. Detén solo el backend y vuelve a iniciarlo con la misma configuración y el mismo archivo `video-toma-01`. Comprueba con un GET o desde la tienda que la Manzana conserva stock 2 y la Piña stock 45.

Si abres la consola H2 en `http://localhost:8081/h2-console` con esa base especial, la JDBC URL debe coincidir con `jdbc:h2:file:./data/video-toma-01`. Una consulta útil es:

```sql
SELECT ID, NOMBRE, STOCK, STOCK_MINIMO FROM PRODUCTOS ORDER BY ID;
```

> La señal del navegador se pierde al recargar, pero H2 guarda los productos en un archivo. Por eso las existencias sobreviven incluso al reinicio del servidor.

## 6:25–7:40 — Angular y comunicación

Abre el método `reponer` de `ProductoApi`, el evento de la tarjeta y el manejador del componente principal.

> El input recoge la cantidad y la tarjeta emite el id y esa cantidad mediante output. El padre llama a ProductoApi. HttpClient devuelve un Observable y subscribe atiende éxito y error. En éxito, actualizo la lista con la respuesta del servidor. En error, muestro su mensaje.

Señala `stockMinimo` en la interfaz y el `computed` del contador.

> Una señal guarda un estado que puede cambiar. El computed del contador depende del catálogo y se recalcula cuando cambia esa señal. Así no tengo que llevar un contador separado y sincronizarlo manualmente.

## 7:40–8:30 — Cierre y evidencias

Muestra `pruebas.http`, los resultados de las comprobaciones que realmente ejecutaste y el historial de Git. No atribuyas resultados a pruebas que no se hayan corrido.

> La funcionalidad recorre todas las capas: modelo, servicio, API y componentes. Comprobé la reposición válida, el rechazo de cantidades inválidas, el límite de 50 y la validación del stock mínimo. El código del frontend y el backend está separado en dos carpetas dentro de la entrega.

Antes de enviar, revisa que el enlace al video pueda abrirse con los permisos apropiados y que no supere 10 minutos. La grabación y su subida no se sustituyen por este guion.

## Preguntas para ensayar sin leer

- ¿Por qué se valida también en el servidor?
- ¿Qué diferencia hay entre 400, 404 y 409?
- ¿Qué ocurre con el inventario después del intento que superaría 50?
- ¿Por qué el contador incluye la Papaya, pero su tarjeta dice «Agotado»?
- ¿Qué estado vive en una señal y qué información persiste en H2?
- ¿Por qué se usa la respuesta de la API y no una suma local?
- ¿Para qué sirven `input`, `output`, `subscribe` y `computed`?
