package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.request.UsuarioUpdateRequestDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.security.UsuarioPrincipal;
import com.sistema.FloreriaBack.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> registrar(@Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(dto));
    }

    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO buscarPorId(@PathVariable UUID id) {
        return service.buscarPorId(id);
    }

    /** Solo ADMINISTRADOR (regla de SecurityConfig para /api/usuarios/**). */
    @PutMapping("/{id}")
    public UsuarioResponseDTO actualizar(@PathVariable UUID id,
                                         @Valid @RequestBody UsuarioUpdateRequestDTO dto,
                                         @AuthenticationPrincipal UsuarioPrincipal actual) {
        return service.actualizar(id, dto, idDe(actual));
    }

    /** Borrado lógico: el usuario ya no puede iniciar sesión y su token deja de funcionar. */
    @PatchMapping("/{id}/desactivar")
    public UsuarioResponseDTO desactivar(@PathVariable UUID id,
                                         @AuthenticationPrincipal UsuarioPrincipal actual) {
        return service.cambiarEstado(id, false, idDe(actual));
    }

    @PatchMapping("/{id}/activar")
    public UsuarioResponseDTO activar(@PathVariable UUID id,
                                      @AuthenticationPrincipal UsuarioPrincipal actual) {
        return service.cambiarEstado(id, true, idDe(actual));
    }

    private UUID idDe(UsuarioPrincipal actual) {
        return actual != null ? actual.getId() : null;
    }
}
