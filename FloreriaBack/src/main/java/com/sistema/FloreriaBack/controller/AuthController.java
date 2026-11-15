package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.CambioContrasenaRequestDTO;
import com.sistema.FloreriaBack.dto.request.CambioEmailRequestDTO;
import com.sistema.FloreriaBack.dto.request.EliminarCuentaRequestDTO;
import com.sistema.FloreriaBack.dto.request.LoginRequestDTO;
import com.sistema.FloreriaBack.dto.request.PerfilUpdateRequestDTO;
import com.sistema.FloreriaBack.dto.request.RegistroRequestDTO;
import com.sistema.FloreriaBack.dto.response.AuthResponseDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.security.UsuarioPrincipal;
import com.sistema.FloreriaBack.service.AuthService;
import com.sistema.FloreriaBack.service.CuentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Login, registro y CRUD de la cuenta propia ("Mi cuenta").
 * Los endpoints /me son de cualquier rol con sesión y siempre actúan sobre el usuario del token.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CuentaService cuentaService;

    public AuthController(AuthService authService, CuentaService cuentaService) {
        this.authService = authService;
        this.cuentaService = cuentaService;
    }

    /** Público. Recibe email y contraseña; devuelve el token JWT. */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    /** C — Público. Registra un nuevo CLIENTE y devuelve su token JWT. */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(dto));
    }

    /** R — Datos del usuario que inició sesión. */
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> usuarioActual(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(cuentaService.obtener(usuario.getId()));
    }

    /** U — Actualiza nombres, apellidos, teléfono, distrito y dirección. */
    @PutMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> actualizarPerfil(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                                               @Valid @RequestBody PerfilUpdateRequestDTO dto) {
        return ResponseEntity.ok(cuentaService.actualizarPerfil(usuario.getId(), dto));
    }

    /** U — Cambia la contraseña (pide la actual). */
    @PutMapping("/me/contrasena")
    public ResponseEntity<Void> cambiarContrasena(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                                  @Valid @RequestBody CambioContrasenaRequestDTO dto) {
        cuentaService.cambiarContrasena(usuario.getId(), dto);
        return ResponseEntity.noContent().build();
    }

    /** U — Cambia el correo (pide la contraseña) y devuelve un token nuevo. */
    @PutMapping("/me/email")
    public ResponseEntity<AuthResponseDTO> cambiarEmail(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                                        @Valid @RequestBody CambioEmailRequestDTO dto) {
        return ResponseEntity.ok(cuentaService.cambiarEmail(usuario.getId(), dto));
    }

    /** D — Elimina la cuenta propia (pide la contraseña). */
    @DeleteMapping("/me")
    public ResponseEntity<Void> eliminarCuenta(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                               @Valid @RequestBody EliminarCuentaRequestDTO dto) {
        cuentaService.eliminarCuenta(usuario.getId(), dto);
        return ResponseEntity.noContent().build();
    }
}
