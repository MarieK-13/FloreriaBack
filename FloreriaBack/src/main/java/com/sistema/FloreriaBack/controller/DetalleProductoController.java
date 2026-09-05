package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.DetalleProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.DetalleProductoResponseDTO;
import com.sistema.FloreriaBack.service.DetalleProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/detalle-productos")
public class DetalleProductoController {

    private final DetalleProductoService service;

    public DetalleProductoController(DetalleProductoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DetalleProductoResponseDTO> registrar(@Valid @RequestBody DetalleProductoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(dto));
    }

    @GetMapping
    public List<DetalleProductoResponseDTO> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public DetalleProductoResponseDTO buscarPorId(@PathVariable UUID id) { return service.buscarPorId(id); }

    @GetMapping("/producto/{productoId}")
    public DetalleProductoResponseDTO buscarPorProducto(@PathVariable UUID productoId) {
        return service.buscarPorProducto(productoId);
    }
}
