# Mercado Nativo · segundo parcial

Mini tienda del Laboratorio de Ingeniería de Software III. Continúa la tienda Angular anterior y agrega una API Spring Boot con persistencia H2.

**Funcionalidad elegida: B, reposición controlada y alerta de stock bajo.**

## Requisitos

- Java 21 o superior (probado en este equipo con Java 25).
- Node.js 24 y npm.
- No es necesario instalar MySQL. Maven Wrapper descarga Maven al primer uso.

## Abrir y ejecutar

Abre esta carpeta completa en Visual Studio Code para ver ambos proyectos y el historial Git. Necesitas dos terminales.

Terminal 1, backend:

```powershell
cd tienda-api
.\mvnw.cmd spring-boot:run
```

Terminal 2, frontend:

```powershell
cd mini-tienda
npm ci
npm start
```

- Tienda: http://localhost:4200
- API: http://localhost:8081/api/productos
- Consola H2: http://localhost:8081/h2-console
- JDBC URL: `jdbc:h2:file:./data/tiendadb`, usuario `sa`, contraseña vacía.

**Por qué 8081:** el puerto 8080 está ocupado por el servicio Oracle de este equipo. No hay que detenerlo. El cambio no modifica las rutas de la API ni sus reglas. La consola H2 está habilitada solo para desarrollo local.

Al primer inicio aparecen Manzana (3), Piña (5), Pera (2) y Papaya (0). Todos tienen `stockMinimo: 2`; el contador inicial es 2 porque incluye los productos agotados.

## Qué permite hacer

- Consultar, crear, actualizar y eliminar productos mediante la API.
- Comprar una unidad, actualizar catálogo y carrito, y rechazar compras sin stock.
- Reponer entre 1 y 20 unidades por solicitud, sin superar 50 unidades finales.
- Mostrar el aviso «¡Stock bajo!» y el contador calculado con `computed()`.
- Crear productos con un stock mínimo configurable.
- Mostrar los mensajes de validación y de negocio que devuelve el servidor.

Las reposiciones rechazadas no cambian el inventario. Las reglas están en Java, no solamente en el formulario.

Como en la guía, **cada clic en Comprar descuenta inmediatamente el stock del servidor**. El carrito es temporal y se vacía al recargar; no representa un checkout ni una compra pagada. No se implementan los retos opcionales de pagos, autenticación o devoluciones.

## Estructura

```text
mini-tienda/       Angular: componentes, señales y servicio HTTP
tienda-api/        Spring Boot: modelo, repositorio, servicio y controlador
docs/             Explicación, requisitos y guion de demostración
```

## Pruebas

```powershell
cd tienda-api
.\mvnw.cmd test
```

```powershell
cd mini-tienda
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Las pruebas backend usan una base H2 de memoria, no el inventario personal. `tienda-api/pruebas.http` se puede ejecutar con REST Client en VS Code y contiene las ocho solicitudes base y los cuatro escenarios de la opción B.

**Los escenarios B parten de las semillas iniciales.** No ejecutar primero la compra de pera de las pruebas base y esperar después que B1 termine en 7. Para una demostración limpia, inicia el backend con una base nueva:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.datasource.url=jdbc:h2:file:./data/video-toma-01"
```

Usa el mismo nombre al reiniciar para comprobar la persistencia; cambia el nombre si necesitas otra toma desde cero. No hace falta borrar bases de datos.

## Entrega

El correo del profesor solicita elegir una funcionalidad, enviar un ZIP con ambos proyectos y proporcionar un enlace a un video de máximo 10 minutos. Fecha indicada: **30 de octubre de 2026, 6:00 p. m. (Colombia)**.

El ZIP debe excluir `node_modules`, `dist`, `.angular`, `target` y las bases `data`. Las dependencias se reconstruyen con `npm ci` y Maven Wrapper.

Consulta `docs/GUIA-VIDEO.md` para practicar la demostración y `docs/COMO-FUNCIONA.md` para entender los flujos. Antes de enviar, revisa `docs/VERIFICACION.md` y prueba el arranque en tu equipo.

Los commits registran etapas reales de esta continuación. No se modificaron sus fechas. El proyecto anterior se conserva en su carpeta original; esta entrega está separada para no alterar la primera publicación.
