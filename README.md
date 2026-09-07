# 🌸 FloriaSmart — Backend

Sistema web para la **gestión y comercialización de productos de una florería**, desarrollado como API REST con Spring Boot. Centraliza el catálogo, el inventario, los usuarios, las cotizaciones y los pedidos bajo un esquema de roles (Administrador, Vendedor y Cliente).

> Avance **APF1** — Curso *Desarrollo Web Integrado*. Primera versión funcional del back-end.

---

## 📑 Contenido

- [Características](#-características)
- [Tecnologías](#-tecnologías)
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
- Manejo global de errores con códigos HTTP estandarizados (400, 404, etc.).
- Suite de **pruebas automatizadas** (JUnit 5, Mockito y MockMvc).

---

## 🛠 Tecnologías

| Componente | Detalle |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.1.1 |
| Gestor de dependencias | Maven |
| Persistencia | Spring Data JPA + PostgreSQL |
| Seguridad de contraseñas | spring-security-crypto (BCrypt) |
| Validación | Jakarta Bean Validation |
| Reducción de código | Lombok |
| Pruebas unitarias | JUnit 5 + Mockito |
| Pruebas de controladores | MockMvc (standalone) |
| Pruebas de API | Postman |

---


## 🧪 Pruebas

Para ejecutar la suite completa de pruebas automatizadas:

```bash
./mvnw test
```

Las pruebas cubren:

- **Capa Service** (JUnit 5 + Mockito): registro, validaciones de negocio, cifrado de contraseñas verificado con `ArgumentCaptor` y cálculo de totales con `BigDecimal`.
- **Capa Controller** (MockMvc standalone): códigos de estado HTTP y activación de las validaciones de entrada.

Las pruebas manuales de la API se encuentran en la colección de **Postman** dentro de `03_Pruebas_API/`.

---

## 📂 Estructura del proyecto

Arquitectura por capas, organizada por responsabilidad:

```
src/main/java/com/floriasmart/
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
└── config/        # Beans compartidos (ej. PasswordEncoder)
```

**Entidades principales:** Usuario, Categoria, Producto, DetalleProducto, Cotizacion, ItemCotizacion, Pedido, DetallePedido.

---

## 🔌 Endpoints principales

Base URL: `http://localhost:8080/api`

| Recurso | Método | Ruta | Descripción |
|---|---|---|---|
| Usuarios | POST | `/usuarios` | Registrar usuario |
| | GET | `/usuarios` | Listar usuarios |
| | GET | `/usuarios/{id}` | Buscar por ID |
| Categorías | POST | `/categorias` | Registrar categoría |
| | GET | `/categorias` | Listar categorías |
| | DELETE | `/categorias/{id}` | Eliminar (si no tiene productos) |
| Productos | POST | `/productos` | Registrar producto |
| | GET | `/productos` | Listar productos |
| | GET | `/productos/categoria/{id}` | Productos por categoría |
| Detalle producto | POST | `/detalle-productos` | Registrar ficha técnica |
| | GET | `/detalle-productos/producto/{id}` | Ficha por producto |
| Cotizaciones | POST | `/cotizaciones` | Generar cotización |
| | GET | `/cotizaciones/usuario/{id}` | Historial por usuario |
| Pedidos | POST | `/pedidos` | Crear pedido |
| | GET | `/pedidos/usuario/{id}` | Pedidos por usuario |
| | PATCH | `/pedidos/{id}/estado?nuevoEstado=` | Cambiar estado |

> La documentación detallada de cada endpoint (parámetros, cuerpos de ejemplo y respuestas) está en el informe del APF1 y en la colección de Postman.

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

<p align="center">🌷 <em>FloriaSmart — Avance APF1</em> 🌷</p>
