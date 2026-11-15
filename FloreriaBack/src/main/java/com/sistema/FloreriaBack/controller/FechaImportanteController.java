package com.sistema.FloreriaBack.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sistema.FloreriaBack.dto.request.FechaImportanteRequestDTO;
import com.sistema.FloreriaBack.dto.response.FechaImportanteResponseDTO;
import com.sistema.FloreriaBack.service.FechaImportanteService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mis-fechas")
@PreAuthorize("isAuthenticated()") 
public class FechaImportanteController {

    private final FechaImportanteService service;

    public FechaImportanteController(FechaImportanteService service) {
        this.service = service;
    }

    @GetMapping
    public List<FechaImportanteResponseDTO> listar() {
        return service.listarMisFechas();
    }

    @PostMapping
    public ResponseEntity<FechaImportanteResponseDTO> registrar(@Valid @RequestBody FechaImportanteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crearFecha(dto));
    }

    @PutMapping("/{id}")
    public FechaImportanteResponseDTO actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody FechaImportanteRequestDTO dto) {
        return service.actualizarFecha(id, dto);
    }

    @PatchMapping("/{id}/anticipacion")
    public FechaImportanteResponseDTO actualizarAnticipacion(
            @PathVariable UUID id,
            @RequestParam Integer dias) {
        return service.actualizarDiasAnticipacion(id, dias);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminarFecha(id);
        return ResponseEntity.noContent().build();
    }
}