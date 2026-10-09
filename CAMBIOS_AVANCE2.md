# Cambios del Avance 2 — FloriaSmart Backend

Resumen de lo que se agregó para cumplir los requerimientos pendientes.

## 1. Consultas JPQL (`@Query`)

| Repositorio | Método | Para qué sirve |
|---|---|---|
| `ProductoRepository` | `buscarPorNombreYPrecioMaximo` | Buscador del catálogo (nombre parcial + precio máximo, solo disponibles) |
| `ProductoRepository` | `buscarConStockBajo` | Alerta de reposición de inventario |
| `PedidoRepository` | `buscarPorRangoDeFechas` | Reporte de pedidos entre dos fechas |
| `PedidoRepository` | `sumarVentasEnRango` | Total vendido en un periodo (sin cancelados) |
| `PedidoRepository` | `contarPedidosEnRango` | Cantidad de pedidos en un periodo (sin cancelados) |
| `PedidoRepository` | `buscarIdUsuarioDelPedido` | Verificar que un cliente solo vea sus pedidos |
| `CotizacionRepository` | `buscarIdUsuarioDeCotizacion` | Verificar que un cliente solo vea sus cotizaciones |

Las consultas de productos y pedidos usan `JOIN FETCH` para traer las relaciones en una sola consulta y evitar el problema N+1.
Se exponen en `GET /api/productos/buscar`, `GET /api/productos/stock-bajo`, `GET /api/pedidos/reportes/rango` y `GET /api/pedidos/reportes/ventas`.

## 2. Seguridad con JWT y roles

Archivos nuevos:

- `pom.xml`: se reemplazó `spring-security-crypto` por `spring-boot-starter-security` y se agregaron `jjwt-api`, `jjwt-impl` y `jjwt-jackson`.
- `security/JwtUtils`: genera y valida tokens firmados (HS256) con la clave de `JWT_SECRET`.
- `security/JwtAuthenticationFilter`: filtro `OncePerRequestFilter` que lee `Authorization: Bearer <token>` y registra al usuario en el `SecurityContextHolder`.
- `security/UserDetailsServiceImpl` y `security/UsuarioPrincipal`: cargan el usuario desde la BD por email; el rol se convierte en `ROLE_ADMINISTRADOR`, `ROLE_OPERARIO` o `ROLE_CLIENTE`. Un usuario con `activo = false` no puede entrar.
- `security/SeguridadService`: reglas de propiedad usadas en `@PreAuthorize` (un cliente solo ve sus pedidos y cotizaciones).
- `config/SecurityConfig`: `SecurityFilterChain` sin sesiones (STATELESS), endpoints públicos y protegidos por rol, CORS y respuestas 401/403 en JSON.
- `config/AdminInitializer`: crea el primer administrador si se definen `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
- `controller/AuthController`: `POST /api/auth/login`, `POST /api/auth/register` y `GET /api/auth/me`.

Decisiones importantes:

- **El registro público siempre crea CLIENTES.** Si se permitiera elegir el rol, cualquiera podría registrarse como administrador. Por eso `POST /api/usuarios` (que sí acepta rol) ahora es solo para ADMINISTRADOR.
- **Roles:** se usaron los del enum `RolUsuario` (ADMINISTRADOR, CLIENTE, OPERARIO). El README antiguo decía "Vendedor"; se corrigió a "Operario".
- **Doble nivel de autorización:** reglas por rol en `SecurityFilterChain` y reglas de propiedad con `@PreAuthorize`.

## 3. Credenciales

`application.properties` ya leía la base de datos desde variables de entorno. Se siguió el mismo criterio para la clave JWT (`JWT_SECRET`) y el administrador inicial, así que no hay contraseñas escritas en el código.

## 4. Pruebas nuevas

- `security/JwtUtilsTest`: token válido, de otro usuario, alterado, firmado con otra clave, expirado y clave demasiado corta.
- `service/ConsultasJpqlServiceTest`: reporte de ventas, total 0 sin pedidos, rango de fechas inválido y validaciones de búsqueda.

Las pruebas existentes no se modificaron.

## Cómo ejecutar

1. Definir las variables de entorno (en IntelliJ: *Run > Edit Configurations > Environment variables*; en VS Code: `"env"` en `launch.json`). Ejemplo:

   ```
   DB_URL=jdbc:postgresql://localhost:5432/floriasmart
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   JWT_SECRET=una-clave-larga-de-al-menos-32-caracteres-123456
   ADMIN_EMAIL=admin@floriasmart.com
   ADMIN_PASSWORD=Admin123
   ```

2. Ejecutar `./mvnw test` y luego `./mvnw spring-boot:run`.

## Cómo probar en Postman

Importar `FloriaSmart_Seguridad.postman_collection.json`. Los requests de login guardan el token automáticamente en una variable, así que basta con ejecutarlos en orden:

1. **Login admin** → guarda `tokenAdmin`.
2. **Registro cliente** → guarda `tokenCliente` y `clienteId`.
3. Probar los casos: catálogo sin token (200), crear producto sin token (401), crear producto como cliente (403), crear producto como admin (201), reporte de ventas como admin (200) y como cliente (403).
