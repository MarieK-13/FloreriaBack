# FloriaSmart — Frontend

Aplicación web de FloriaSmart creada con Angular 21, componentes standalone y SCSS. El frontend vive separado del backend Spring Boot, en `FloreriaFront/`.

## Requisitos y ejecución

- Node.js 20.19+, 22.12+ o 24+
- npm
- Backend ejecutándose en `http://localhost:8080`

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`. El servidor de desarrollo reenvía las peticiones `/api` al backend local. Para compilar producción: `npm run build`.

## Estructura

```text
src/
├── app/
│   ├── core/                 # Infraestructura transversal
│   │   ├── api/              # URL base y configuración HTTP
│   │   ├── guards/           # Protección de rutas privadas
│   │   ├── interceptors/     # JWT y manejo común de errores HTTP
│   │   ├── models/           # Tipos compartidos entre funcionalidades
│   │   └── services/         # Sesión y servicios globales
│   ├── features/             # Funcionalidades agrupadas por flujo
│   │   ├── auth/             # Inicio de sesión y registro
│   │   ├── carrito/          # Carrito y entrega
│   │   ├── catalogo/         # Categorías, filtros y productos
│   │   ├── cotizaciones/     # Asistente y cotización personalizada
│   │   ├── fechas/           # Fechas importantes y recordatorios
│   │   ├── favoritos/        # Productos guardados
│   │   ├── home/             # Inicio y campañas
│   │   ├── nosotros/         # Información de la florería
│   │   ├── pedidos/          # Historial y seguimiento
│   │   └── perfil/           # Datos personales y seguridad
│   ├── layout/               # Cabecera y pie compartidos
│   │   └── components/
│   ├── shared/               # Componentes visuales sin lógica de negocio
│   │   ├── components/
│   │   │   ├── product-card/
│   │   │   ├── section-heading/
│   │   │   └── ui-button/
│   │   ├── directives/
│   │   ├── models/
│   │   ├── pipes/
│   │   └── utils/
│   ├── app.ts                # Root: monta layout y router-outlet
│   ├── app.scss
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/             # Configuración por entorno
├── styles.scss
└── main.ts
```

La organización sigue los recorridos que aparecen en los mockups, no una carpeta por cada tabla de la base de datos. Cada feature contiene sus `pages/`, `services/` y `models/`; por ejemplo, el catálogo reúne la navegación por categoría, los filtros y el detalle del producto. La sesión, guards e interceptores van en `core/`; la cabecera, navegación y pie que se repiten en las pantallas van en `layout/`. `shared/` queda para componentes visuales reutilizados que no pertenecen a un flujo específico.

Las rutas de cada flujo se cargan de forma diferida desde `app.routes.ts`. El acceso a la API vive en servicios y usa la URL de `core/api/api.config.ts`. Las pantallas de administración no se agregaron porque no aparecen en los mockups recibidos; se pueden incorporar cuando exista ese diseño.

La parte de Tienda pública cubre Inicio, Catálogo con filtros y orden, detalle de productos/packs y Nosotros. El catálogo consulta los endpoints públicos `/api/productos`, `/api/categorias` y `/api/detalle-productos`; no usa un catálogo paralelo de datos ficticios.

Los filtros de precio, color, tamaño, ocasión, categoría y disponibilidad usan campos existentes en el catálogo y sus fichas. El mockup también muestra “Más recientes” y productos en campaña/descuento; la fecha de creación y los datos de campañas no están incluidos en el DTO actual del backend. Por eso esa opción de ordenamiento se muestra deshabilitada y el filtro de campañas solo coincide si la descripción de un producto declara una campaña o descuento.

`CartService` mantiene en memoria las cantidades y el subtotal mientras la aplicación está abierta. Es el estado compartido para que la tarjeta de producto y la cabecera reflejen los artículos agregados; no implementa persistencia ni confirmación de pedidos.

## Plantillas en TypeScript

Las plantillas Angular de los componentes se escriben inline en la propiedad `template` del decorador `@Component`; no se crean archivos `.html` por pantalla o componente. `src/index.html` se conserva porque Angular lo necesita como documento host para arrancar la aplicación. Aunque la plantilla esté dentro de TypeScript, el marcado que contiene sigue usando la sintaxis de templates Angular.

## Base visual para nuevas pantallas

El root de la aplicación (`app.ts`) mantiene la cabecera y el pie de página alrededor del `router-outlet`; las páginas nuevas no deben duplicarlos. Los estilos globales y tokens visuales viven en `src/styles.scss`: usar las variables `--color-*`, `--radius-card`, `--shadow-card` y `--content-width` para conservar la paleta verde, rosa y crema de los mockups.

La página de inicio sirve como referencia para el equipo y demuestra los componentes reutilizables:

- `app-ui-button`: variantes `primary`, `outline` y `quiet`; acepta contenido con `<ng-content />`.
- `app-section-heading`: encabezado de sección con `title`, `eyebrow` y `subtitle`.
- `app-product-card`: tarjeta de producto tipada, con precio, etiquetas, imagen opcional y evento `add`.
- `app-site-header` y `app-site-footer`: navegación persistente y enlaces generales.

Al crear un componente compartido, seguir el patrón `shared/components/<nombre>/<nombre>.ts` y `<nombre>.scss`; escribir la plantilla en la propiedad `template` del decorador `@Component`. Mantenerlo configurable mediante inputs tipados, emitir eventos mediante outputs y evitar acoplarlo a servicios o datos propios de una feature. Los componentes exclusivos de una pantalla permanecen dentro de la feature correspondiente. Las imágenes definitivas se agregan en `public/` y se referencian desde sus datos; no incrustar recursos temporales en los estilos.

## Convenciones

- Usar componentes standalone y tipos explícitos; evitar módulos Angular nuevos.
- Mantener en `core/` servicios transversales (autenticación, interceptores y guards).
- Mantener cada flujo, sus modelos y acceso a datos dentro de su carpeta `features/<dominio>/`.
- No crear módulos por entidad de base de datos si la pantalla forma parte de un flujo mayor, como el catálogo.
- Mantener en `layout/` solo las piezas persistentes de navegación; las páginas siguen perteneciendo a su feature.
- Poner en `shared/` solo elementos realmente reutilizables entre dominios.
- No guardar secretos en los archivos de entorno; configurarlos en el entorno de despliegue.

## Comandos

```bash
npm start       # Desarrollo con proxy al backend
npm run build   # Compilación de producción
npm test        # Pruebas unitarias
```
