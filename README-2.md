# 🌸 FloriaSmart — Backend

Sistema web para la **gestión y comercialización de productos de una florería**, desarrollado como API REST con Spring Boot. Centraliza el catálogo, el inventario, los usuarios, las cotizaciones y los pedidos bajo un esquema de roles (Administrador, Operario y Cliente) protegido con **Spring Security + JWT**.

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

## 🛠 Tecnologías

| Componente | Detalle |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.1.1 |
| Gestor de dependencias | Maven |
| Persistencia | Spring Data JPA + PostgreSQL |
| Seguridad | Spring Security + JWT (JJWT 0.12) |
| Cifrado de contraseñas | BCrypt |
| Validación | Jakarta Bean Validation |
| Reducción de código | Lombok |
| Pruebas unitarias | JUnit 5 + Mockito |
| Pruebas de controladores | MockMvc (standalone) |
| Pruebas de API | Postman |

---


## ⚙️ Configuración y ejecución

La aplicación no guarda credenciales en el código: todo se lee de **variables de entorno**.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DB_URL` | Sí | Ej. `jdbc:postgresql://localhost:5432/floriasmart` |
| `DB_USER` | Sí | Usuario de PostgreSQL |
| `DB_PASSWORD` | Sí | Contraseña de PostgreSQL |
| `JWT_SECRET` | Sí | Clave para firmar los tokens (mínimo 32 caracteres) |
| `JWT_EXPIRATION_MS` | No | Duración del token (por defecto 86400000 = 24 h) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | No | Si se definen, crea el primer ADMINISTRADOR al arrancar |
| `CORS_ORIGINS` | No | Orígenes del front-end permitidos, separados por comas |

```
./mvnw spring-boot:run
```

---

## 🔐 Seguridad (JWT y roles)

1. El usuario inicia sesión en `POST /api/auth/login` y recibe un **token JWT**.
2. En cada petición protegida envía la cabecera `Authorization: Bearer <token>`.
3. `JwtAuthenticationFilter` valida el token y Spring Security aplica las reglas de acceso.

| Rol | Puede |
|---|---|
| Público (sin token) | Login, registro y consultar el catálogo (productos, categorías, fichas) |
| `CLIENTE` | Crear y consultar **sus propios** pedidos y cotizaciones |
| `OPERARIO` | Ver todos los pedidos y cotizaciones, cambiar el estado de pedidos, ver stock bajo |
| `ADMINISTRADOR` | Todo lo anterior + gestionar catálogo y usuarios, y ver reportes de ventas |

El registro público (`/api/auth/register`) siempre crea usuarios `CLIENTE`. Los usuarios `OPERARIO` o `ADMINISTRADOR` los crea un administrador desde `POST /api/usuarios`.

Respuestas de error: **401** si falta el token o es inválido/expirado, **403** si el rol no tiene permiso.

---

## 🧪 Pruebas

Para ejecutar la suite completa de pruebas automatizadas:

```bash
./mvnw test
```

Las pruebas cubren:

- **Capa Service** (JUnit 5 + Mockito): registro, validaciones de negocio, cifrado de contraseñas verificado con `ArgumentCaptor` y cálculo de totales con `BigDecimal`.
- **Capa Controller** (MockMvc standalone): códigos de estado HTTP y activación de las validaciones de entrada.
- **Seguridad** (`JwtUtilsTest`): generación y validación de tokens, tokens alterados, expirados o firmados con otra clave.
- **Consultas JPQL** (`ConsultasJpqlServiceTest`): reportes de ventas, rangos de fechas y búsqueda de productos.

> `FloreriaBackApplicationTests` levanta el contexto completo, por lo que necesita las variables de entorno de la base de datos y `JWT_SECRET`.

Las pruebas manuales de la API se encuentran en la colección de **Postman** dentro de `03_Pruebas_API/`.

---

## 📂 Estructura del proyecto

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

## 🔌 Endpoints principales

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
