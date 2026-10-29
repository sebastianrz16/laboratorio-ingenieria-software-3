# Matriz de requisitos y verificación

Funcionalidad seleccionada: **B. Reposición controlada y alerta de stock bajo**.

Fuente: guías del laboratorio de Spring Boot (Primera y Segunda Parte), enunciado B y rúbrica de «Funcionalidades segundo parcial». Resultados técnicos contrastados con las ejecuciones descritas en VERIFICACION.md. La sustentación y el video siguen pendientes del estudiante.

Las rutas siguientes son relativas a la raíz de esta entrega.

## Requisitos del enunciado B

| Requisito | Ubicación prevista en el código o evidencia | Verificación esperada | Estado |
| --- | --- | --- | --- |
| Atributo `stockMinimo`, Integer, por defecto 2, no negativo, getter y setter. | `tienda-api/src/main/java/com/curso/tiendaapi/modelo/Producto.java` | Leer entidad; crear sin campo y consultar valor 2; crear negativo responde 400. | COMPROBADO |
| Misma propiedad y nombre en TypeScript. | `mini-tienda/src/app/models/producto.interface.ts` | Contrastar interfaz con JSON de la API. | COMPROBADO |
| Las cuatro frutas iniciales incluyen stock mínimo 2. | `tienda-api/src/main/java/com/curso/tiendaapi/config/DatosIniciales.java` | GET inicial: stocks 3, 5, 2, 0 y mínimos 2. | COMPROBADO |
| Reposición acepta de 1 a 20 unidades. | `tienda-api/src/main/java/com/curso/tiendaapi/servicio/ProductoService.java` | Casos válidos y bordes 0, 1, 20, 21 y 30. | COMPROBADO |
| Cantidad fuera de rango devuelve 400 y mensaje exacto. | `ProductoService.reponer` y `config/ManejadorErrores.java` | `{"mensaje":"La cantidad debe estar entre 1 y 20"}`. | COMPROBADO |
| No se repone si el stock final superaría 50. | `ProductoService.reponer` | Respuesta 409, «El stock no puede superar las 50 unidades»; stock sin cambios. | COMPROBADO |
| Endpoint exacto POST `/{id}/reponer/{cantidad}`. | `tienda-api/src/main/java/com/curso/tiendaapi/controlador/ProductoController.java` | Probar ruta bajo `/api/productos` y producto inexistente 404. | COMPROBADO |
| `ProductoApi.reponer(id, cantidad)`. | `mini-tienda/src/app/servicios/producto-api.ts` | Comprobar método POST, URL y tipado del producto devuelto. | COMPROBADO |
| Input y botón Reponer sustituyen al +5 stock. | `mini-tienda/src/app/components/producto-card/` | Introducir cantidad; evento incluye id y cantidad; no queda botón +5. | COMPROBADO |
| El padre llama al endpoint y usa respuesta del servidor. | `mini-tienda/src/app/app.component.ts` | `subscribe` con `next` y `error`; reemplazo de producto sin suma local de stock. | COMPROBADO |
| Aviso «¡Stock bajo!» solo con stock positivo y menor o igual al mínimo. | `components/producto-card/` | Pera inicial muestra aviso; Papaya muestra «Agotado». | COMPROBADO |
| Computed cuenta productos por debajo o igual a su mínimo, incluidos agotados. | `mini-tienda/src/app/app.component.ts` y su plantilla | Inicial 2; reponer5 Pera →1; comprar Manzana hasta2 vuelve a subir. | COMPROBADO |
| Campo «Stock mínimo» por defecto 2 al crear. | `mini-tienda/src/app/components/producto-form/` | Crear producto, consultar respuesta y recargar. | COMPROBADO |
| Errores del servidor aparecen en el aviso existente. | `AppComponent`: `mostrarMensaje` / `textoError` | Enviar30 desde tarjeta; mostrar mensaje de la API, no un texto genérico. | COMPROBADO |
| Sección de pruebas B reproducible. | `tienda-api/pruebas.http` | Ejecutar escenarios B1 a B4 con datos iniciales. | COMPROBADO |
| Persistencia al recargar y reiniciar. | `tienda-api/src/main/resources/application.properties` y H2 | Cambiar stock, reiniciar sobre el mismo archivo de BD, consultar el mismo valor. | COMPROBADO |

## Escenarios HTTP exigidos

Cada sección comienza con los datos iniciales indicados en el enunciado. No repetir operaciones acumulativas esperando la respuesta de la primera ejecución.

| Escenario | Acción | Resultado esperado | Estado |
| --- | --- | --- | --- |
| B1 | POST `/api/productos/3/reponer/5` con Pera en 2. | 200, `stock: 7`. | COMPROBADO |
| B2 | POST `/api/productos/2/reponer/30`. | 400; Piña conserva stock5. | COMPROBADO |
| B3.1 | POST `/api/productos/2/reponer/20`. | 200, Piña stock25. | COMPROBADO |
| B3.2 | Repetir B3.1. | 200, Piña stock45. | COMPROBADO |
| B3.3 | Repetir B3.1 por tercera vez. | 409; Piña permanece en45. | COMPROBADO |
| B4 | POST producto con `stockMinimo: -1`. | 400; no se crea. | COMPROBADO |

El enunciado llama a esto cuatro peticiones o escenarios, pero B3 exige tres solicitudes consecutivas: son seis solicitudes HTTP en total.

## Base de las guías: checklist 12.1

| Requisito base | Evidencia | Estado |
| --- | --- | --- |
| Backend arranca con Maven Wrapper. | Arranque sin errores desde `tienda-api`. | COMPROBADO |
| GET `/api/productos` devuelve JSON. | Respuesta 200 y catálogo de cuatro frutas al iniciar una BD vacía. | COMPROBADO |
| Ocho peticiones base de `pruebas.http`. | Códigos 200,200,201,200,200,409,400,204. | COMPROBADO |
| Consola H2 y tabla PRODUCTOS. | Acceso local `/h2-console`, consulta de tabla con JDBC URL correcta. | COMPROBADO |
| Catálogo Angular desde la API. | Petición GET en Network; no catálogo hardcodeado en la señal. | COMPROBADO |
| Compra descuenta stock persistente. | POST comprar y recarga conservan existencias. | COMPROBADO |
| Pestaña desactualizada recibe conflicto al comprar agotado. | Dos pestañas; mensaje «Lo sentimos, ya no hay stock». | COMPROBADO |
| Formulario crea y muestra errores de validación del servidor. | Crear válido201 e inválido400 con mensajes. | COMPROBADO |
| Reposición y eliminación persisten. | B sustituye el botón +5; ambas acciones se mantienen tras recarga. | COMPROBADO |

## Rúbrica

| Criterio | Peso | Evidencia que debe presentarse | Estado |
| --- | --- | --- | --- |
| Modelo y persistencia | 15% | Entidad, interfaz, valores iniciales, validación y reinicio conservando cambios. | COMPROBADO |
| Reglas de negocio en servicio | 25% | Dos reglas de `reponer`, códigos400/409 y textos exactos; stock sin cambio al rechazar. | COMPROBADO |
| Endpoint y pruebas | 15% | Ruta y método exactos; secciónB en `pruebas.http`, con resultados esperados. | COMPROBADO |
| Servicio Angular y comunicación | 15% | Método `reponer`, suscripción éxito/error, reemplazo con respuesta y mensaje del servidor. | COMPROBADO |
| Interfaz | 20% | Tarjeta, computed y campo del formulario funcionan sin recargar. | COMPROBADO |
| Calidad y sustentación | 10% | Organización por capas y guía disponibles; explicación propia y video máximo10min. | POR GRABAR |

La rúbrica propone limitar la nota si el estudiante no puede explicar su código. La preparación de la sustentación forma parte de la entrega; no basta con ejecutar el sistema.

## Material que se entrega

- ZIP con carpetas separadas `mini-tienda` y `tienda-api`, sin `node_modules`, `target`, bases de datos locales ni secretos.
- `pruebas.http` con la base y la sección B.
- Instrucciones de arranque y versiones utilizadas.
- Video de máximo10min en un enlace accesible para el profesor.
- Historial Git real por etapas; no alterar fechas para aparentar trabajo anterior. El aviso actual exige ZIP y video, no exige explícitamente publicar esta nueva entrega en GitHub Pages.

El frontend estático por sí solo no ejecuta Spring Boot. Publicar una página no sustituye entregar y arrancar el backend.

