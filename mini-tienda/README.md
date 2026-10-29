# Mercado Nativo — frontend

Mini tienda en Angular 21.2 con componentes standalone y signals. Continúa el diseño de la primera práctica y consulta el inventario de Spring Boot.

## Ejecutar

Requiere Node.js 24 y el backend encendido en el puerto 8081.

```powershell
npm ci
npm start
```

Abrir http://localhost:4200. La URL de la API se configura en `src/environments/environment.ts`.

## Verificar

```powershell
npm run build
npm run test:ci
```

Las pruebas usan Chrome Headless. Si Chrome no está en la ruta habitual, definir `CHROME_BIN` con la ubicación de su ejecutable.

## Organización

- `app.component.ts`: carga del catálogo, acciones contra la API, carrito y contador de stock bajo.
- `servicios/producto-api.ts`: peticiones HTTP; los componentes hijos no acceden directamente al servidor.
- `components/producto-card`: recibe el producto por `input.required()` y emite eventos de compra, reposición y eliminación.
- `components/producto-form`: formulario con signals y `ngModel`; mantiene sus datos si el servidor rechaza la creación.
- `models/producto.interface.ts`: contrato compartido con la entidad Java, incluido `stockMinimo`.
- `public/imagenes`: ilustraciones SVG locales; no hacen falta descargas externas.

El servidor valida la reposición: de 1 a 20 unidades y máximo 50 unidades finales. La interfaz permite enviar valores fuera de rango para mostrar el mensaje real del servidor. El contador incluye agotados; el aviso «¡Stock bajo!» aparece solo si queda alguna unidad.

El carrito es temporal, como en la guía: recargar borra su contenido, pero el stock comprado ya quedó guardado en la base de datos. No es un checkout de producción ni maneja pagos.

Ver el README de la carpeta principal para entrega, demostración y pruebas del backend.
