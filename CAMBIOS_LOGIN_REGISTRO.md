# Login, registro y CRUD de la cuenta — FloriaSmart

Resumen de lo que se agregó para el login, el registro y "Mi cuenta", en el **backend** y en el **frontend**. Basado en los mockups (págs. 11, 12 y 13).

## CRUD de la cuenta propia

Todo vive en `/api/auth`. Los endpoints `/me` funcionan para cualquier rol con sesión y siempre actúan sobre el usuario del token (nadie puede editar la cuenta de otro por aquí).

| Operación | Método y ruta | Pantalla | Respuesta |
|---|---|---|---|
| Iniciar sesión | `POST /api/auth/login` | `/ingresar` | 200 + token |
| **C** Registrarse | `POST /api/auth/register` | `/registro` | 201 + token |
| **R** Ver mis datos | `GET /api/auth/me` | `/mi-cuenta` | 200 |
| **U** Editar datos personales | `PUT /api/auth/me` | `/mi-cuenta` → Datos personales | 200 |
| **U** Cambiar contraseña | `PUT /api/auth/me/contrasena` | `/mi-cuenta` → Acceso y seguridad | 204 |
| **U** Cambiar correo | `PUT /api/auth/me/email` | `/mi-cuenta` → Acceso y seguridad | 200 + **token nuevo** |
| **D** Eliminar mi cuenta | `DELETE /api/auth/me` | `/mi-cuenta` → Acceso y seguridad | 204 |

Decisiones:

- **Qué se pide al registrarse:** solo lo necesario para comprar: nombres, apellidos, correo, celular (para coordinar la entrega), contraseña y aceptar los términos. Distrito y dirección se completan después en "Mi cuenta", porque muchas veces las flores se envían a la dirección de otra persona.
- **Términos:** el backend exige `aceptaTerminos: true` (`@AssertTrue`) y guarda la fecha en `terminos_aceptados_en`.
- **Contraseña equivocada en Mi cuenta → 400, no 401.** Así el front no cierra la sesión solo porque la persona escribió mal su contraseña.
- **Cambiar correo devuelve un token nuevo**, porque el token guarda el email; el token anterior deja de servir.
- **Eliminar cuenta:** no se borra la fila porque los pedidos y cotizaciones apuntan al usuario (daría error de llave foránea). Se borran los datos personales (nombre, apellidos, teléfono, distrito, dirección), el correo pasa a `eliminado-<id>@floriasmart.invalid` (así la persona puede volver a registrarse con su correo) y la cuenta queda desactivada. Se pide la contraseña para confirmar.
- **Un administrador no puede eliminar su propia cuenta** (para no quedarse sin administradores), igual que la regla que ya existía de no quitarse su propio rol.

## Backend (`FloreriaBack`)

| Archivo | Cambio |
|---|---|
| `model/Usuario` | Nuevos campos opcionales en la BD: `apellidos`, `telefono`, `distrito`, `direccion`, `terminosAceptadosEn`. `ddl-auto=update` agrega las columnas sin romper a los usuarios que ya existen |
| `dto/request/RegistroRequestDTO` | `apellidos`, `telefono` (celular peruano), contraseña de 6 a 72 caracteres, `aceptaTerminos` |
| `dto/request/PerfilUpdateRequestDTO` | Nuevo: datos de "Mi cuenta" |
| `dto/request/CambioContrasenaRequestDTO` | Nuevo: `contrasenaActual`, `nuevaContrasena`, `confirmacion` |
| `dto/request/CambioEmailRequestDTO` | Nuevo: `nuevoEmail`, `contrasenaActual` |
| `dto/request/EliminarCuentaRequestDTO` | Nuevo: `contrasena` |
| `dto/response/UsuarioResponseDTO` | Devuelve también apellidos, teléfono, distrito y dirección (se dejó el constructor de 5 parámetros para las pruebas anteriores) |
| `service/CuentaService` + `impl/CuentaServiceImpl` | Nuevo: la lógica del CRUD de la cuenta propia |
| `service/AuthService` + `impl/AuthServiceImpl` | Registro con los campos nuevos; `generarSesion(email)` para emitir tokens |
| `controller/AuthController` | Endpoints `PUT /me`, `PUT /me/contrasena`, `PUT /me/email`, `DELETE /me` |
| `util/DatosPersonales` | Nuevo: normaliza email (minúsculas), celular (`+51987654321`) y textos opcionales |
| `UsuarioRepository` + `UserDetailsServiceImpl` | Login sin distinguir mayúsculas en el correo |

Validaciones: el celular debe tener 9 dígitos, empezar en 9 y puede llevar `+51` y espacios. La contraseña debe tener entre 6 y 72 caracteres, porque BCrypt solo usa los primeros 72 bytes.

Pruebas nuevas (integración con H2 y MockMvc):

- `security/AuthIntegracionTest`: 14 casos de registro y login: registro correcto, intento de registrarse como admin, sin términos, email repetido, teléfono inválido, contraseña muy larga, usuario inactivo, etc.
- `security/CuentaIntegracionTest`: 15 casos del CRUD: ver, editar, campos inválidos, sin token, cambiar contraseña (correcta, actual incorrecta, confirmación distinta, igual a la actual), cambiar correo (token nuevo, el viejo deja de servir, correo ya usado, contraseña incorrecta) y eliminar cuenta (correcta, contraseña incorrecta, administrador).

También se actualizó la colección de Postman, con la nueva carpeta **"5. Mi cuenta (CRUD de la cuenta propia)"**, y `GUIA_PRUEBAS_CRUD.md`.

## Frontend (`FloreriaFront`)

| Archivo | Para qué sirve |
|---|---|
| `core/services/auth.service.ts` | Login, registro, logout y sesión. "Recordarme" usa `localStorage`; sin él, `sessionStorage` |
| `core/services/account.service.ts` | CRUD de la cuenta (`/api/auth/me`) |
| `core/interceptors/auth.interceptor.ts` | Agrega el token. Si el backend responde 401, cierra la sesión y lleva al login |
| `core/guards/auth.guards.ts` | `authGuard`, `guestGuard`, `roleGuard('ADMINISTRADOR')` |
| `features/auth/pages/login.page.ts` | `/ingresar`: formulario, ilustración de ramo, etiquetas flotantes y franja de beneficios |
| `features/auth/pages/registro.page.ts` | `/registro`: formulario, ilustración y "Con tu cuenta podrás…" |
| `features/perfil/pages/mi-cuenta.page.ts` | `/mi-cuenta` (solo con sesión): menú lateral y tarjetas |
| `features/perfil/components/datos-personales.ts` | Editar nombres, apellidos, teléfono, distrito y dirección |
| `features/perfil/components/seguridad-cuenta.ts` | Cambiar correo, cambiar contraseña y eliminar la cuenta |
| `shared/components/ui-icon/ui-icon.ts` | Íconos de línea reutilizables |
| `shared/validators/form-validators.ts` | Celular peruano, texto no vacío, contraseñas iguales |
| `public/images/ramo-rosas.svg`, `ramo-girasoles.svg` | Ilustraciones de ramos (propias, sin derechos de terceros) |

En el encabezado, con sesión iniciada, aparece el primer nombre (como "Ana" en el mockup) y enlaza a "Mi cuenta". "Cerrar sesión" está en el menú de "Mi cuenta".

**Imágenes:** los ramos son ilustraciones vectoriales hechas para el proyecto. Si consiguen fotos de sus arreglos, basta con reemplazar los archivos de `public/images/` (o cambiar el `src` del `<img>` en las páginas). Se ven recortadas en círculo, igual que la "foto de ramo" del mockup.

**Pendiente (necesita más backend):** recuperar la contraseña por correo ("¿Olvidaste tu contraseña?" por ahora muestra un aviso), la página de términos y "Mis pedidos" dentro de Mi cuenta (pág. 14 del mockup).

## Cómo probar

1. Backend: definir las variables de entorno (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`) y ejecutar `./mvnw spring-boot:run`. Pruebas: `./mvnw test`.
2. Frontend: `cd FloreriaFront && npm install && npm start` y abrir http://localhost:4200/registro.
3. Crear una cuenta → el nombre aparece en el encabezado → clic en el nombre → "Mi cuenta": editar datos, cambiar contraseña, cambiar correo, cerrar sesión, volver a entrar y eliminar la cuenta.
