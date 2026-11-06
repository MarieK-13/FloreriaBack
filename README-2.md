# 🌸 FloriaSmart — Backend

API REST para la gestión y comercialización de una florería: productos, categorías, fichas técnicas, cotizaciones, pedidos y usuarios, con persistencia en PostgreSQL y seguridad con Spring Security + JWT.

> Avance **APF2** — Curso *Desarrollo Web Integrado*. Persistencia con JPA, consultas JPQL y seguridad con JWT.

---

## 📑 Contenido

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Configuración y ejecución](#️-configuración-y-ejecución)
- [Seguridad (JWT y roles)](#-seguridad-jwt-y-roles)
- [Pruebas](#-pruebas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Endpoints principales](#-endpoints-principales)
- [Equipo](#-equipo)

---

## ✨ Características

- Gestión de **usuarios** con contraseñas cifradas (BCrypt) y roles.
- Gestión de **categorías** y **productos** con control de stock.
- **Fichas técnicas** de producto (cuidados, materiales, duración, entrega).
- **Cotizaciones** que calculan el total con el precio real del catálogo y validan stock y presupuesto.
- **Pedidos** con detalle, cambio de estado y reposición automática de stock al cancelar.
- **Autenticación con JWT** (login y registro) y **autorización por roles** con Spring Security.
- **Consultas JPQL** (`@Query`) para búsqueda de catálogo, alertas de stock y reportes de ventas.
- Manejo global de errores con códigos HTTP estandarizados (400, 401, 403, 404).
- Suite de **pruebas automatizadas** (JUnit 5, Mockito y MockMvc).

---

## 1. Tecnologías

| Componente | Detalle |
|---|---|
| Lenguaje / build | Java 17, Maven (wrapper incluido: `mvnw`) |
| Framework | Spring Boot 4.1.1 |
| Gestor de dependencias | Maven |
| Persistencia | Spring Data JPA + Hibernate, PostgreSQL |
| Seguridad | Spring Security, JWT (JJWT 0.12), BCrypt |
| Validación | Jakarta Bean Validation |
| Pruebas | JUnit 5, Mockito, MockMvc, `@DataJpaTest` y `@SpringBootTest` sobre H2 (solo en pruebas) |
| Pruebas de API | Postman |

## 2. Requisitos previos

- Java 17 o superior instalado (`java -version`).
- PostgreSQL 15 o superior en funcionamiento.
- No hace falta instalar Maven: se usa `mvnw`.

## 3. Base de datos

1. Crear la base de datos vacía:
   ```sql
   CREATE DATABASE floriasmart;
   ```
2. **Opción A (recomendada):** arrancar la aplicación. Hibernate crea las 8 tablas a partir de las entidades (`spring.jpa.hibernate.ddl-auto=update`).
3. **Opción B:** restaurar el script de la carpeta `03_Base_de_Datos/` en la base `floriasmart` antes de arrancar.

> Si ya tenía una base creada con una versión anterior del proyecto, ejecute además (Hibernate no modifica columnas existentes):
> ```sql
> ALTER TABLE cotizaciones ALTER COLUMN total TYPE numeric(10,2), ALTER COLUMN presupuesto TYPE numeric(10,2);
> ALTER TABLE items_cotizacion ALTER COLUMN precio_unitario TYPE numeric(10,2), ALTER COLUMN subtotal TYPE numeric(10,2);
> UPDATE producto SET disponible = (stock > 0) WHERE disponible IS NULL;
> ALTER TABLE producto ALTER COLUMN disponible SET NOT NULL;
> UPDATE usuarios SET email = lower(trim(email));
> ```

## 4. Variables de entorno

Las credenciales **no** están en el código: se leen del entorno.

| Variable | ¿Obligatoria? | Descripción | Por defecto |
|---|---|---|---|
| `DB_PASSWORD` | Sí | Contraseña del usuario de PostgreSQL | — |
| `JWT_SECRET` | Sí | Clave para firmar los tokens (**mínimo 32 caracteres**). Si falta o es corta, la aplicación no arranca | — |
| `DB_URL` | No | URL JDBC | `jdbc:postgresql://localhost:5432/floriasmart` |
| `DB_USER` | No | Usuario de PostgreSQL | `postgres` |
| `JWT_EXPIRATION_MS` | No | Duración del token en milisegundos | `86400000` (24 h) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | No | Si se definen ambas, se crea el administrador inicial al arrancar (si no existe) | — |
| `CORS_ORIGINS` | No | Orígenes permitidos del front-end, separados por comas | `http://localhost:4200,http://localhost:5173,http://localhost:3000` |

## 5. Ejecutar el backend

**Windows (PowerShell):**
```powershell
$env:DB_PASSWORD="<su-clave-de-postgres>"
$env:JWT_SECRET="<texto-aleatorio-de-32-o-mas-caracteres>"
$env:ADMIN_EMAIL="admin@floriasmart.com"
$env:ADMIN_PASSWORD="<clave-del-admin>"
.\mvnw spring-boot:run
```

**Linux / macOS:**
```bash
export DB_PASSWORD="<su-clave-de-postgres>"
export JWT_SECRET="<texto-aleatorio-de-32-o-mas-caracteres>"
export ADMIN_EMAIL="admin@floriasmart.com"
export ADMIN_PASSWORD="<clave-del-admin>"
./mvnw spring-boot:run
```

En un IDE (VS Code, IntelliJ) defina las mismas variables en la configuración de ejecución. La API queda en `http://localhost:8080`.

## 6. Probar la autenticación (JWT)

1. **Login** (devuelve el token):
   ```bash
   curl -s -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@floriasmart.com","contrasena":"<clave-del-admin>"}'
   ```
   Copie el valor de `token` de la respuesta.
2. **Endpoint protegido con token** (esperado: 200):
   ```bash
   curl -s http://localhost:8080/api/usuarios -H "Authorization: Bearer <TOKEN>"
   ```
3. **Sin token** (esperado: 401):
   ```bash
   curl -i http://localhost:8080/api/usuarios
   ```
4. **Rol insuficiente** (esperado: 403): registre un cliente y use su token en un endpoint de administrador.
   ```bash
   curl -s -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" \
     -d '{"nombre":"Cliente Prueba","email":"cliente.prueba@correo.com","contrasena":"<clave-de-prueba>"}'
   # con el token del cliente:
   curl -i http://localhost:8080/api/usuarios -H "Authorization: Bearer <TOKEN_CLIENTE>"
   ```

El registro público (`/api/auth/register`) siempre crea usuarios con rol **CLIENTE**. Los usuarios OPERARIO y ADMINISTRADOR los crea un administrador con `POST /api/usuarios`.

## 7. Roles y permisos

| Recurso | Sin token | CLIENTE | OPERARIO | ADMINISTRADOR |
|---|---|---|---|---|
| Login y registro | ✔ | ✔ | ✔ | ✔ |
| Catálogo (productos, categorías, fichas): lectura | ✔ | ✔ | ✔ | ✔ |
| Productos con stock bajo | 401 | 403 | ✔ | ✔ |
| Crear, modificar o eliminar catálogo | 401 | 403 | 403 | ✔ |
| Gestionar usuarios | 401 | 403 | 403 | ✔ |
| Crear pedido o cotización | 401 | solo a su nombre | a nombre de cualquiera | ✔ |
| Consultar un pedido o cotización | 401 | solo los suyos | todos | todos |
| Listar todos los pedidos y cotizaciones | 401 | 403 | ✔ | ✔ |
| Cambiar el estado de un pedido | 401 | 403 | ✔ | ✔ |
| Reportes de ventas | 401 | 403 | 403 | ✔ |

Las reglas por rol viven en `SecurityConfig`; las reglas de propiedad (un cliente solo ve lo suyo) se aplican con `@PreAuthorize` y `SeguridadService`.

## 8. Endpoints principales

Base URL: `http://localhost:8080/api`

| Recurso | Método | Ruta | Acceso | Descripción |
|---|---|---|---|---|
| Autenticación | POST | `/auth/login` | Público | Iniciar sesión (devuelve token) |
| | POST | `/auth/register` | Público | Registrarse como cliente (devuelve token) |
| | GET | `/auth/me` | Autenticado | Datos del usuario actual |
| Usuarios | POST | `/usuarios` | Admin | Registrar usuario con cualquier rol |
| | GET | `/usuarios` | Admin | Listar usuarios |
| | GET | `/usuarios/{id}` | Admin | Buscar por ID |
| Categorías | POST | `/categorias` | Admin | Registrar categoría |
| | GET | `/categorias` | Público | Listar categorías |
| | DELETE | `/categorias/{id}` | Admin | Eliminar (si no tiene productos) |
| Productos | POST / PUT / DELETE | `/productos` | Admin | Registrar, actualizar, eliminar |
| | GET | `/productos` | Público | Listar productos |
| | GET | `/productos/categoria/{id}` | Público | Productos por categoría |
| | GET | `/productos/buscar?nombre=&precioMax=` | Público | Búsqueda por nombre y precio máximo (JPQL) |
| | GET | `/productos/stock-bajo?limite=5` | Admin, Operario | Productos con poco stock (JPQL) |
| Detalle producto | POST | `/detalle-productos` | Admin | Registrar ficha técnica |
| | GET | `/detalle-productos/producto/{id}` | Público | Ficha por producto |
| Cotizaciones | POST | `/cotizaciones` | Autenticado (dueño) | Generar cotización |
| | GET | `/cotizaciones` | Admin, Operario | Listar todas |
| | GET | `/cotizaciones/{id}` | Dueño o personal | Buscar por ID |
| | GET | `/cotizaciones/usuario/{id}` | Dueño o personal | Historial por usuario |
| Pedidos | POST | `/pedidos` | Autenticado (dueño) | Crear pedido |
| | GET | `/pedidos` | Admin, Operario | Listar todos |
| | GET | `/pedidos/{id}` | Dueño o personal | Buscar por ID |
| | GET | `/pedidos/usuario/{id}` | Dueño o personal | Pedidos por usuario |
| | PATCH | `/pedidos/{id}/estado?nuevoEstado=` | Admin, Operario | Cambiar estado |
| | GET | `/pedidos/reportes/rango?inicio=&fin=` | Admin | Pedidos entre fechas (JPQL) |
| | GET | `/pedidos/reportes/ventas?inicio=&fin=` | Admin | Total vendido y cantidad de pedidos (JPQL) |

> La documentación detallada de cada endpoint (parámetros, cuerpos de ejemplo y respuestas) está en los informes de los avances y en la colección de Postman.

---

## 9. Pruebas automáticas

```bash
./mvnw test        # en Windows: .\mvnw test
```

Usan una base H2 en memoria (`src/test/resources/application.properties`): **no requieren PostgreSQL ni variables de entorno**. Incluyen pruebas unitarias (servicios), de controladores (MockMvc), de repositorios (`@DataJpaTest`), de seguridad con JWT y de integración (rollback y concurrencia).

## 10. Colección de Postman

`FloriaSmart_Seguridad.postman_collection.json` (en la entrega, carpeta `04_Pruebas_API/`).

1. Importarla en Postman.
2. Completar las variables de colección `adminEmail` y `adminPassword` con las mismas credenciales de `ADMIN_EMAIL` / `ADMIN_PASSWORD` (la contraseña viene vacía a propósito).
3. Ejecutar las carpetas en orden: los tokens y los identificadores se guardan solos en las variables de colección.

## 11. Estructura del proyecto

Arquitectura por capas, organizada por responsabilidad:

```
src/main/java/com/sistema/FloreriaBack/
├── model/         # Entidades JPA y enumeraciones
├── repository/    # Interfaces JpaRepository (acceso a datos)
├── dto/
│   ├── request/   # Datos que recibe la API
│   └── response/  # Datos que expone la API
├── mapper/        # Conversión entidad ⇆ DTO
├── service/
│   └── impl/      # Reglas de negocio (validaciones, cálculos)
├── controller/    # Endpoints REST
├── exception/     # Excepciones propias + GlobalExceptionHandler
├── config/        # PasswordEncoder, SecurityConfig, administrador inicial
└── security/      # JwtUtils, JwtAuthenticationFilter, UserDetailsService, reglas de propiedad
```

**Entidades principales:** Usuario, Categoria, Producto, DetalleProducto, Cotizacion, ItemCotizacion, Pedido, DetallePedido.

---

## 👥 Equipo

**Curso:** Desarrollo Web Integrado
**Docente:** Kevin Frederick Sachun Becerra
**Ciclo:** 2026 — ICA, Perú

| Integrante |
|---|
| Astohuaman Espino, Daniela |
| Champe Baldeón, Abel |
| Cuadros Palomino, Karla |
| Vilca Flores, Marife Guadalupe |

---

<p align="center">🌷 <em>FloriaSmart — Avance APF2</em> 🌷</p>
