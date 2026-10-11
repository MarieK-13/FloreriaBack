# Persona 1 (Abel) — CRUD completo y eliminación segura

## Qué se implementó

| Tarea | Endpoint nuevo | Respuestas |
|---|---|---|
| 1.1 Categorías | `PUT /api/categorias/{id}` | 200, 400 (nombre repetido o inválido), 404 |
| 1.2 Usuarios | `PUT /api/usuarios/{id}` | 200, 400 (email repetido, contraseña corta, admin se quita su rol), 404 |
| 1.2 Usuarios | `PATCH /api/usuarios/{id}/desactivar` | 200, 400 (admin se desactiva a sí mismo), 404 |
| 1.2 Usuarios | `PATCH /api/usuarios/{id}/activar` | 200, 404 |
| 1.3 Fichas técnicas | `PUT /api/detalle-productos/{id}` | 200, 400 (duración no positiva), 404 |
| 1.3 Fichas técnicas | `DELETE /api/detalle-productos/{id}` | 204, 404 |
| 1.4 Productos | `DELETE /api/productos/{id}` (corregido) | 204, 400 (en pedidos o cotizaciones), 404 |
| 1.5 Errores | Handler de `DataIntegrityViolationException` | 409 en vez de 500 |

Todos los endpoints nuevos exigen rol ADMINISTRADOR (ya lo cubría `SecurityConfig`, no se modificó).

Ajustes respecto al plan original:

- **Contraseña opcional:** se usó `@Pattern(regexp = "^$|^.{6,}$")` en lugar de `@Size(min = 6)`, porque `@Size` rechazaba la cadena vacía, que aquí significa "no cambiar la contraseña".
- **El administrador tampoco puede quitarse su propio rol** con el PUT (además de no poder desactivarse), para que el sistema no se quede sin administrador.
- **Cambio de email:** el token JWT guarda el email, así que si un usuario cambia su email debe volver a iniciar sesión. Es el comportamiento esperado.

## Archivos modificados

- **Nuevos:** `UsuarioUpdateRequestDTO`, `DetalleProductoUpdateRequestDTO`, `ItemCotizacionRepository`.
- **Modificados:** `CategoriaController/Service/ServiceImpl/Mapper`, `UsuarioController/Service/ServiceImpl/Mapper`, `DetalleProductoController/Service/ServiceImpl/Mapper`, `ProductoServiceImpl` (solo el constructor y `eliminar`), `DetallePedidoRepository`, `GlobalExceptionHandler`.
- **Pruebas:** se agregaron 39 pruebas en las clases de prueba de Categoría, Usuario, DetalleProducto y Producto (servicio y controlador). En `ConsultasJpqlServiceTest` solo cambió la línea que construye `ProductoServiceImpl`, porque su constructor ahora recibe tres repositorios más (**avisar a Persona 2**).

No se tocaron: `PedidoServiceImpl`, `ProductoRepository`, `SecurityConfig`, `pom.xml`, `README`, Postman.

## 1. Pruebas automáticas

```
.\mvnw test
```

Resultado esperado: **Tests run: 154, Failures: 0, Errors: 0** y `BUILD SUCCESS`.

## 2. Prueba rápida de todos los endpoints (PowerShell)

Con el servidor corriendo (`.\mvnw spring-boot:run` con `ADMIN_EMAIL=admin@floriasmart.com` y `ADMIN_PASSWORD=Admin123`), abre una segunda terminal y pega este bloque. Cada línea debe salir `[OK]` en verde.

```powershell
$base = "http://localhost:8080"
$t = Get-Date -Format "HHmmss"
function Probar($nombre, $metodo, $ruta, $esperado, $token = $null, $cuerpo = $null) {
  $h = @{}
  if ($token) { $h["Authorization"] = "Bearer $token" }
  $p = @{ Uri = "$base$ruta"; Method = $metodo; Headers = $h; UseBasicParsing = $true }
  if ($cuerpo) { $p.Body = ($cuerpo | ConvertTo-Json -Depth 5); $p.ContentType = "application/json" }
  $json = $null
  try { $r = Invoke-WebRequest @p; $codigo = [int]$r.StatusCode; if ($r.Content) { $json = $r.Content | ConvertFrom-Json } }
  catch { $codigo = [int]$_.Exception.Response.StatusCode }
  $ok = $codigo -eq $esperado
  Write-Host ("[{0}] {1} -> {2} (esperado {3})" -f $(if ($ok) {"OK   "} else {"FALLO"}), $nombre, $codigo, $esperado) -ForegroundColor $(if ($ok) {"Green"} else {"Red"})
  return $json
}
Write-Host "`n--- LOGIN ---"
$admin = Probar "Login admin" POST "/api/auth/login" 200 -cuerpo @{email="admin@floriasmart.com"; contrasena="Admin123"}
$A = $admin.token
Write-Host "`n--- CATEGORIAS: UPDATE ---"
$c1 = Probar "Crear categoria A" POST "/api/categorias" 201 $A @{nombre="Cat A $t"; descripcion="Primera"}
$c2 = Probar "Crear categoria B" POST "/api/categorias" 201 $A @{nombre="Cat B $t"; descripcion="Segunda"}
$null = Probar "Actualizar categoria A" PUT "/api/categorias/$($c1.id)" 200 $A @{nombre="Cat A editada $t"; descripcion="Editada"}
$null = Probar "Actualizar con nombre de otra categoria" PUT "/api/categorias/$($c1.id)" 400 $A @{nombre="Cat B $t"}
$null = Probar "Actualizar categoria inexistente" PUT "/api/categorias/00000000-0000-0000-0000-000000000000" 404 $A @{nombre="X"}
Write-Host "`n--- FICHAS TECNICAS: UPDATE Y DELETE ---"
$p1 = Probar "Crear producto 1" POST "/api/productos" 201 $A @{nombre="Girasoles $t"; precio=30; stock=5; categoriaId=$c1.id}
$f1 = Probar "Crear ficha del producto 1" POST "/api/detalle-productos" 201 $A @{productoId=$p1.id; cuidados="Agua diaria"; duracionDias=7}
$null = Probar "Actualizar ficha" PUT "/api/detalle-productos/$($f1.id)" 200 $A @{cuidados="Agua cada 2 dias"; duracionDias=10; ocasion="Cumpleanos"}
$null = Probar "Actualizar ficha con duracion 0" PUT "/api/detalle-productos/$($f1.id)" 400 $A @{duracionDias=0}
$null = Probar "Eliminar ficha" DELETE "/api/detalle-productos/$($f1.id)" 204 $A
$null = Probar "Eliminar ficha ya eliminada" DELETE "/api/detalle-productos/$($f1.id)" 404 $A
Write-Host "`n--- PRODUCTOS: DELETE SEGURO ---"
$p2 = Probar "Crear producto 2" POST "/api/productos" 201 $A @{nombre="Tulipanes $t"; precio=40; stock=5; categoriaId=$c1.id}
$f2 = Probar "Crear ficha del producto 2" POST "/api/detalle-productos" 201 $A @{productoId=$p2.id; cuidados="Sombra"; duracionDias=5}
$null = Probar "Eliminar producto con ficha (borra la ficha primero)" DELETE "/api/productos/$($p2.id)" 204 $A
$null = Probar "La ficha del producto eliminado ya no existe" GET "/api/detalle-productos/producto/$($p2.id)" 404
$p3 = Probar "Crear producto 3" POST "/api/productos" 201 $A @{nombre="Lirios $t"; precio=50; stock=5; categoriaId=$c1.id}
$cli = Probar "Registrar cliente" POST "/api/auth/register" 201 -cuerpo @{nombre="Cliente $t"; email="cli$t@correo.com"; contrasena="cliente123"}
$null = Probar "Cliente compra el producto 3" POST "/api/pedidos" 201 $cli.token @{usuarioId=$cli.usuarioId; direccionEntrega="Av. Lima 456"; detalles=@(@{productoId=$p3.id; cantidad=1})}
$null = Probar "Eliminar producto con pedido (bloqueado, no 500)" DELETE "/api/productos/$($p3.id)" 400 $A
Write-Host "`n--- USUARIOS: UPDATE Y DESACTIVAR ---"
$U = "/api/usuarios/$($cli.usuarioId)"
$null = Probar "Actualizar usuario sin cambiar contrasena" PUT $U 200 $A @{nombre="Cliente Editado $t"; email="cli$t@correo.com"; rol="CLIENTE"; contrasena=""}
$null = Probar "Contrasena de menos de 6 caracteres" PUT $U 400 $A @{nombre="Cliente Editado $t"; email="cli$t@correo.com"; rol="CLIENTE"; contrasena="123"}
$null = Probar "Cambiar contrasena" PUT $U 200 $A @{nombre="Cliente Editado $t"; email="cli$t@correo.com"; rol="CLIENTE"; contrasena="nueva123"}
$sesion = Probar "Login con la contrasena nueva" POST "/api/auth/login" 200 -cuerpo @{email="cli$t@correo.com"; contrasena="nueva123"}
$null = Probar "Desactivar usuario" PATCH "$U/desactivar" 200 $A
$null = Probar "Usuario desactivado intenta iniciar sesion" POST "/api/auth/login" 403 -cuerpo @{email="cli$t@correo.com"; contrasena="nueva123"}
$null = Probar "Usuario desactivado usa su token anterior" GET "/api/auth/me" 401 $sesion.token
$null = Probar "Admin intenta desactivarse a si mismo" PATCH "/api/usuarios/$($admin.usuarioId)/desactivar" 400 $A
$null = Probar "Reactivar usuario" PATCH "$U/activar" 200 $A
$null = Probar "Usuario reactivado inicia sesion" POST "/api/auth/login" 200 -cuerpo @{email="cli$t@correo.com"; contrasena="nueva123"}
```

## 3. Evidencias que pide el documento

| Evidencia | Cómo obtenerla |
|---|---|
| Postman por módulo (URL, método, cuerpo y respuesta) | Repetir en Postman las peticiones del script: PUT de categoría, PUT y DELETE de ficha, PUT y PATCH de usuario, DELETE de producto. |
| Tabla en pgAdmin antes y después | Ejecutar las consultas de abajo antes y después de cada cambio. |
| DELETE bloqueado (400) y DELETE correcto (204) | "Eliminar producto con pedido" y "Eliminar producto con ficha". |
| Usuario desactivado: login 403 y token antiguo 401 | Pasos de desactivación del script. Entregar a Persona 4. |
| Persistencia después de reiniciar | Detener el servidor (`Ctrl + C`), volver a arrancarlo y repetir `GET /api/categorias` y `GET /api/usuarios` (con token de admin). |

Consultas para pgAdmin (Query Tool sobre la base `floriasmart`):

```sql
SELECT id, nombre, descripcion FROM categoria;
SELECT id, producto_id, cuidados, duracion_dias, ocasion FROM detalle_producto;
SELECT id, nombre, stock FROM producto;
SELECT id, nombre, email, rol, activo FROM usuarios;
```
