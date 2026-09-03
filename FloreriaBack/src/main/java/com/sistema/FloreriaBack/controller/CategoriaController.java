package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.CategoriaRequestDTO;
import com.sistema.FloreriaBack.dto.response.CategoriaResponseDTO;
import com.sistema.FloreriaBack.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private final CategoriaService service;

    public CategoriaController(CategoriaService service) { // Spring inyecta CategoriaServiceImpl automáticamente
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> registrar(@Valid @RequestBody CategoriaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(dto));
    }

    @GetMapping
    public List<CategoriaResponseDTO> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public CategoriaResponseDTO buscarPorId(@PathVariable UUID id) { return service.buscarPorId(id); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
