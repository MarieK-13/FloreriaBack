package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.LoginRequestDTO;
import com.sistema.FloreriaBack.dto.request.RegistroRequestDTO;
import com.sistema.FloreriaBack.dto.response.AuthResponseDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.security.UsuarioPrincipal;
import com.sistema.FloreriaBack.service.AuthService;
import com.sistema.FloreriaBack.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    public AuthController(AuthService authService, UsuarioService usuarioService) {
        this.authService = authService;
        this.usuarioService = usuarioService;
    }

    /** Público. Recibe email y contraseña; devuelve el token JWT. */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    /** Público. Registra un nuevo CLIENTE y devuelve su token JWT. */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(dto));
    }

    /** Requiere token. Devuelve los datos del usuario que inició sesión. */
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> usuarioActual(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(usuarioService.buscarPorId(usuario.getId()));
    }
}
