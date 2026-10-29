# Comprobaciones de la entrega

Fecha de verificación: 28 de octubre de 2026 (Colombia).

## Resultados ejecutados

- Backend: `./mvnw.cmd -B -ntp package`, 14 pruebas aprobadas, cero fallos. Incluye CRUD, validaciones, valores por defecto, reglas B, límites 1/20/50, 404, JSON inválido, CORS y compra concurrente (8 solicitudes sobre stock 3: 3 éxitos y 5 conflictos).
- Frontend: `npm run build` aprobado; `npm run test:ci`, 15 pruebas aprobadas en ChromeHeadless.
- Navegador Chrome real, frontend4200 y backend8081: catálogo inicial desde API; Pera2→7 y contador2→1; reposición30 rechazada400 con mensaje del servidor; compra actualiza total y contador; crear con mínimo negativo400 conserva formulario; crear válido201, recargar y eliminar204.
- Reposición de Piña20 tres veces: 200,200,409 y stock final45, sin modificación por la petición rechazada.
- Pestaña desactualizada: al intentar comprar después de agotarse en el servidor, aparece «Lo sentimos, ya no hay stock», respuesta409.
- H2: acceso a consola y consulta SQL de PRODUCTOS con sus cuatro frutas, precios, stocks y STOCK_MINIMO.
- Persistencia: reiniciado el proceso Java sobre el mismo archivo H2 aislado; Manzana conserva stock10 y stockMinimo3; siguen cuatro productos, sin duplicar semillas.
- Adaptación: revisión visual escritorio1440 y móvil390; sin desbordamiento horizontal a320. Tecla Tab alcanza el enlace para saltar al contenido y muestra foco visible. Se probaron carga/skeleton, catálogo vacío, fallo de conexión y Reintentar. No aparecieron errores JavaScript.

Las capturas están en `evidencias/`. Los estados vacío/error/carga se provocaron controlando únicamente la respuesta de lectura durante la prueba de interfaz; las compras, creaciones, reposiciones y borrados se comprobaron contra Spring Boot real.

## Entornos aislados

Las pruebas automáticas Java usan H2 en memoria y un puerto aleatorio. Las pruebas visuales y de reinicio usaron archivos H2 separados de `data/tiendadb`; ninguno se incluye en el ZIP ni en Git. No se modificó la primera entrega ni el servicio Oracle del puerto8080.

El carrito sigue siendo temporal, como exige el punto de partida de la guía: F5 lo vacía pero no devuelve el stock. No es un sistema de pago ni se presenta como tal.

## Límites y pendientes del estudiante

- Grabar y revisar un video de máximo10min; comprobar que el profesor puede abrir su enlace.
- Practicar la explicación con `GUIA-VIDEO.md` y `COMO-FUNCIONA.md`; una guía escrita no sustituye la sustentación.
- Enviar ZIP y enlace al profesor correcto. No se ha enviado ningún correo ni publicado un video.
- Se revisaron los estados, el reflujo y aspectos de teclado y foco; no se hizo una auditoría integral de WCAG ni una sesión completa con lector de pantalla.
- GitHub Pages conserva la primera entrega estática. La segunda requiere ejecutar Angular y Spring Boot; subir el código a GitHub no aloja automáticamente el backend.
