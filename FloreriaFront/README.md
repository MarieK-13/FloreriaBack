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
│   │   ├── interceptors/     # JWT y errores HTTP comunes
│   │   ├── models/           # Tipos verdaderamente compartidos
│   │   └── services/         # Sesión y servicios globales
│   ├── features/             # Flujos de usuario mostrados en los mockups
│   │   ├── auth/             # Iniciar sesión y crear cuenta
│   │   ├── carrito/          # Carrito, entrega y confirmación
│   │   ├── catalogo/         # Categorías, filtros y detalle de producto
│   │   ├── cotizaciones/     # Asistente y cotización personalizada
│   │   ├── fechas/           # Fechas importantes y recordatorios
│   │   ├── favoritos/        # Productos guardados
│   │   ├── home/             # Inicio y campañas
│   │   ├── nosotros/         # Información de la florería
│   │   ├── pedidos/          # Historial y seguimiento
│   │   └── perfil/           # Datos personales y seguridad
│   ├── layout/               # Cabecera, navegación y pie comunes
│   ├── shared/               # UI, directivas y pipes reutilizables
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/             # Configuración por entorno
├── styles.scss
└── main.ts
```

La organización sigue los recorridos que aparecen en los mockups, no una carpeta por cada tabla de la base de datos. Cada feature contiene sus `pages/`, `services/` y `models/`; por ejemplo, el catálogo reúne la navegación por categoría, los filtros y el detalle del producto. La sesión, guards e interceptores van en `core/`; la cabecera, navegación y pie que se repiten en las pantallas van en `layout/`. `shared/` queda para componentes visuales reutilizados que no pertenecen a un flujo específico.

Las rutas de cada flujo se cargan de forma diferida desde `app.routes.ts`. El acceso a la API vive en servicios y usa la URL de `core/api/api.config.ts`. Las pantallas de administración no se agregaron porque no aparecen en los mockups recibidos; se pueden incorporar cuando exista ese diseño.

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
