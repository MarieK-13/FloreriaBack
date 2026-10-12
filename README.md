# 🌸 FloriaSmart — Backend (APF2)

Sistema web para la gestión y comercialización de productos de una florería, desarrollado como API REST con **Spring Boot** y persistencia relacional en **PostgreSQL**. Centraliza el catálogo, el inventario, los usuarios, las cotizaciones, los pedidos y reportes financieros bajo un esquema de seguridad con **JWT** y roles (**Administrador**, **Operario** y **Cliente**).

> **Avance APF2 — Curso Desarrollo Web Integrado (UTP 2026 — ICA, Perú).**
> Evolución con persistencia real JPA/Hibernate, Spring Security *stateless* con JWT, transacciones `@Transactional` con bloqueo pesimista y suite automatizada de pruebas.

---

## 📑 Contenido

* [Características](#-características)
* [Tecnologías](#-tecnologías)
* [Requisitos Previos](#-requisitos-previos)
* [Configuración de la Base de Datos](#-configuración-de-la-base-de-datos)
* [Variables de Entorno](#-variables-de-entorno)
* [Ejecución del Backend](#-ejecución-del-backend)
* [Guía de Autenticación y Pruebas con JWT](#-guía-de-autenticación-y-pruebas-con-jwt)
* [Pruebas Automatizadas](#-pruebas-automatizadas)
* [Estructura del Proyecto](#-estructura-del-proyecto)
* [Endpoints Principales](#-endpoints-principales)
* [Equipo](#-equipo)

---

## ✨ Características

* **Persistencia relacional completa:** 8 entidades mapeadas con JPA/Hibernate en PostgreSQL (Usuarios, Categorías, Productos, Fichas Técnicas, Pedidos, DetallePedido, Cotizaciones e ItemCotizacion).
* **Seguridad perimetral y JWT:** API REST *stateless* protegida con Spring Security, tokens firmados con HMAC-SHA256 (HS256) y contraseñas cifradas con **BCrypt**.
* **Esquema de roles unificado:**
  * **`ADMINISTRADOR`:** control total del catálogo, gestión de usuarios y reportes de ventas.
  * **`OPERARIO`:** personal operativo/ventas para gestión de estado de pedidos y revisión de inventario crítico.
  * **`CLIENTE`:** registro público, catálogo, generación de cotizaciones y pedidos propios.
* **Control de concurrencia y atomicidad:** la creación y cancelación de pedidos están protegidas con `@Transactional` y bloqueo pesimista (`SELECT ... FOR UPDATE`), garantizando el descuento y la restitución exacta de stock.
* **Consultas JPQL avanzadas:** filtros de catálogo por nombre y precio máximo, alertas de stock bajo y reportes financieros optimizados con `JOIN FETCH` para evitar el problema de las N+1 consultas.
* **Cotizaciones inmutables:** presupuestos guardados de forma histórica para auditoría comercial.
* **Manejo global de excepciones:** respuestas HTTP estructuradas en JSON para errores `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` y `409 Conflict`.
* **Suite de pruebas automatizadas:** 187 pruebas ejecutables con H2 en memoria.

---

## 🛠 Tecnologías

| Componente | Detalle |
| :--- | :--- |
| **Lenguaje** | Java 17 |
| **Framework** | Spring Boot 3.x |
| **Gestor de dependencias** | Maven (con Wrapper `./mvnw`) |
| **Base de datos** | PostgreSQL (persistencia real) |
| **Base de datos para tests** | H2 Database (modo emulación PostgreSQL) |
| **Persistencia** | Spring Data JPA + Hibernate |
| **Seguridad y JWT** | Spring Security + JJWT + `spring-security-crypto` (BCrypt) |
| **Validación de datos** | Jakarta Bean Validation (`@Valid`, `@NotNull`, etc.) |
| **Reducción de código** | Lombok (`@Getter`, `@Setter`, `@Builder`) |
| **Pruebas automatizadas** | JUnit 5 + Mockito + MockMvc + `@DataJpaTest` + `@SpringBootTest` |
| **Herramientas de cliente** | Postman / pgAdmin 4 |

---

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

* **Java OpenJDK 17** o superior.
* **PostgreSQL 14+** en ejecución.
* **Git** para clonar el repositorio.
* **Postman** (opcional, para pruebas manuales de la API).

---

## 🗄️ Configuración de la Base de Datos

### 1. Crear la base de datos en PostgreSQL

Abre pgAdmin o la terminal `psql` y ejecuta:

```sql
CREATE DATABASE floriasmart;
```

### 2. Generación automática del esquema (JPA/Hibernate)

Al iniciar la aplicación, Hibernate genera y actualiza automáticamente las 8 tablas en el esquema `public` gracias a la propiedad `spring.jpa.hibernate.ddl-auto=update`.

*(Opcional)* Si prefieres restaurar los datos iniciales o el script exportado previamente, utiliza el archivo SQL ubicado en la carpeta `03_Base_de_Datos/` del proyecto.

---

## 🔐 Variables de Entorno

El proyecto lee la configuración sensible desde variables de entorno. Puedes definirlas en tu IDE (Eclipse, IntelliJ, VS Code) o exportarlas en tu terminal.

| Variable | Descripción | Valor de ejemplo / por defecto |
| :--- | :--- | :--- |
| `DB_URL` | URL JDBC de PostgreSQL | `jdbc:postgresql://localhost:5432/floriasmart` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `admin123` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT (mínimo 32 caracteres) | `ClaveSecretaSuperSeguraParaFloriaSmart2026!` |
| `JWT_EXPIRATION_MS` | Tiempo de vida del token en milisegundos (24 h) | `86400000` |
| `ADMIN_EMAIL` | Correo del administrador inicial creado en el arranque | `admin@floriasmart.com` |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial | `Admin123!` |
| `CORS_ORIGINS` | Dominio(s) permitidos para el Front-End | `http://localhost:4200,http://localhost:5173,http://localhost:3000` |

> ⚠️ Los valores anteriores son solo para desarrollo local. En cualquier entorno real, cámbialos por credenciales propias.

---

## 🚀 Ejecución del Backend

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/floriasmart-backend.git
   cd floriasmart-backend
   ```

2. **Establecer las variables de entorno.**

   Linux/macOS:

   ```bash
   export DB_URL="jdbc:postgresql://localhost:5432/floriasmart"
   export DB_USER="postgres"
   export DB_PASSWORD="tu_password"
   export JWT_SECRET="ClaveSecretaSuperSeguraParaFloriaSmart2026!"
   export ADMIN_EMAIL="admin@floriasmart.com"
   export ADMIN_PASSWORD="Admin123!"
   ```

   Windows PowerShell:

   ```powershell
   $env:DB_URL="jdbc:postgresql://localhost:5432/floriasmart"
   $env:DB_USER="postgres"
   $env:DB_PASSWORD="tu_password"
   $env:JWT_SECRET="ClaveSecretaSuperSeguraParaFloriaSmart2026!"
   $env:ADMIN_EMAIL="admin@floriasmart.com"
   $env:ADMIN_PASSWORD="Admin123!"
   ```

3. **Ejecutar la aplicación con Maven Wrapper:**

   ```bash
   ./mvnw spring-boot:run
   ```

> **Nota:** En el primer arranque, la clase `AdminInitializer` crea automáticamente la cuenta de **ADMINISTRADOR** con los datos de `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

---

## 🔑 Guía de Autenticación y Pruebas con JWT

La API es totalmente **stateless** (sin estado). Para consumir endpoints protegidos, adjunta el token JWT en la cabecera HTTP `Authorization` con el prefijo `Bearer `.

### Paso 1: Registrar un nuevo Cliente

* **Método / Ruta:** `POST /api/auth/register`
* **Acceso:** Público
* **Cuerpo (JSON):**

  ```json
  {
    "nombre": "María López",
    "email": "maria@gmail.com",
    "contrasena": "cliente123"
  }
  ```

* **Respuesta esperada (`201 Created`):**

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJpYUBnbWFpbC5jb20iLCJpZCI6IjdiZjQ0ZmZmL...",
    "tipo": "Bearer",
    "expiraEnMs": 86400000,
    "usuarioId": "7bf44fff-8687-49ac-a4b1-82c3778b13f9",
    "nombre": "María López",
    "email": "maria@gmail.com",
    "rol": "CLIENTE"
  }
  ```

### Paso 2: Iniciar sesión (Login)

* **Método / Ruta:** `POST /api/auth/login`
* **Cuerpo (JSON):**

  ```json
  {
    "email": "admin@floriasmart.com",
    "contrasena": "Admin123!"
  }
  ```

* **Respuesta esperada (`200 OK`):** devuelve el `token` JWT del usuario autenticado.

### Paso 3: Consumir endpoints protegidos

Copia el valor del campo `token` recibido en el Login o Registro y configúralo en **Postman** (pestaña **Authorization** → Type: **Bearer Token**) o en cURL:

```bash
curl -X POST http://localhost:8080/api/categorias \
  -H "Authorization: Bearer <TU_TOKEN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Orquídeas", "descripcion": "Macetas exclusivas"}'
```

* Si intentas acceder a endpoints administrativos con un token de **CLIENTE**, recibirás `403 Forbidden`.
* Si accedes sin token, o con un token alterado o expirado, recibirás `401 Unauthorized`.

---

## 🧪 Pruebas Automatizadas

La suite incluye **187 pruebas** distribuidas entre las capas Service (JUnit 5 + Mockito), Controller (MockMvc), Repository (`@DataJpaTest`) e Integración (`@SpringBootTest`).

Para ejecutar la suite completa:

```bash
./mvnw test
```

> **Nota:** Las pruebas corren sobre una base de datos **H2 en memoria** en modo emulación PostgreSQL (`src/test/resources/application.properties`), por lo que **no requieren PostgreSQL en ejecución ni variables de entorno configuradas**.

---

## 📂 Estructura del Proyecto

Arquitectura limpia por capas, organizada por responsabilidades:

```text
src/main/java/com/sistema/FloreriaBack/
├── config/        # Seguridad (SecurityConfig), Beans, AdminInitializer y CORS
├── controller/    # Endpoints REST (AuthController, ProductoController, etc.)
├── dto/
│   ├── request/   # Objetos de entrada con validaciones
│   └── response/  # Objetos de salida formateados
├── exception/     # Excepciones personalizadas y GlobalExceptionHandler
├── mapper/        # Conversión entre entidades y DTOs
├── model/         # Entidades JPA mapeadas a PostgreSQL
│   └── enums/     # RolUsuario, EstadoPedido y EstadoCotizacion
├── repository/    # Interfaces JpaRepository y consultas JPQL personalizadas
├── security/      # JwtUtils, JwtAuthenticationFilter y reglas de propiedad (@PreAuthorize)
└── service/
    └── impl/      # Lógica de negocio y reglas transaccionales
```

---

## 🔌 Endpoints Principales

Base URL: `http://localhost:8080/api`

### 🔑 Autenticación y Perfil

| Método | Ruta | Permiso / Rol | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Público | Registro de nuevos clientes |
| `POST` | `/auth/login` | Público | Autenticación y generación de token JWT |
| `GET` | `/auth/me` | Autenticado | Datos del usuario autenticado |

### 👥 Usuarios (Gestión Administrativa)

| Método | Ruta | Permiso / Rol | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/usuarios` | `ADMINISTRADOR` | Listar todos los usuarios |
| `GET` | `/usuarios/{id}` | `ADMINISTRADOR` | Detalle de usuario por ID |
| `POST` | `/usuarios` | `ADMINISTRADOR` | Crear usuario asignando cualquier rol |
| `PUT` | `/usuarios/{id}` | `ADMINISTRADOR` | Actualizar datos de usuario |
| `PATCH` | `/usuarios/{id}/desactivar` | `ADMINISTRADOR` | Desactivar lógicamente una cuenta |

### 🌺 Categorías y Productos (Catálogo)

| Método | Ruta | Permiso / Rol | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/categorias`, `/productos` | Público | Consultar el catálogo |
| `GET` | `/productos/buscar` | Público | Búsqueda por nombre y precio máximo |
| `GET` | `/productos/stock-bajo` | `ADMINISTRADOR`, `OPERARIO` | Productos con stock crítico |
| `POST` | `/categorias`, `/productos` | `ADMINISTRADOR` | Registrar categoría o producto |
| `PUT` | `/categorias/{id}`, `/productos/{id}` | `ADMINISTRADOR` | Actualizar categoría o producto |
| `DELETE` | `/categorias/{id}`, `/productos/{id}` | `ADMINISTRADOR` | Eliminar (bloqueado si tiene referencias) |

### 📋 Pedidos y Cotizaciones

| Método | Ruta | Permiso / Rol | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/pedidos` | Autenticado (propiedad) | Registrar pedido (procesamiento transaccional) |
| `GET` | `/pedidos/usuario/{id}` | Autenticado (propiedad) | Historial de pedidos de un usuario |
| `GET` | `/pedidos` | `ADMINISTRADOR`, `OPERARIO` | Listar todos los pedidos |
| `PATCH` | `/pedidos/{id}/estado` | `ADMINISTRADOR`, `OPERARIO` | Cambiar estado (restituye stock si se cancela) |
| `POST` | `/cotizaciones` | Autenticado (propiedad) | Solicitar cotización personalizada |
| `GET` | `/pedidos/reportes/ventas` | `ADMINISTRADOR` | Reporte de recaudación por rango de fechas |

---

## 👥 Equipo

**Curso:** Desarrollo Web Integrado  
**Docente:** Kevin Frederick Sachun Becerra  
**Ciclo / Sede:** 2026 — ICA, Perú

| Integrante | Rol |
| :--- | :--- |
| **Astohuaman Espino, Daniela** | Estudiante de Ingeniería de Sistemas |
| **Champe Baldeón, Abel** | Estudiante de Ingeniería de Sistemas |
| **Cuadros Palomino, Karla** | Estudiante de Ingeniería de Sistemas |
| **Vilca Flores, Marife Guadalupe** | Estudiante de Ingeniería de Sistemas |

---

🌷 **FloriaSmart** — *Gestión Inteligente para Florerías* 🌷
