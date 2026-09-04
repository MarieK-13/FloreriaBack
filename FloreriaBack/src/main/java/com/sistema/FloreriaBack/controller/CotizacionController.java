package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.CotizacionRequestDTO;
import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import com.sistema.FloreriaBack.service.CotizacionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cotizaciones")
public class CotizacionController {

    private final CotizacionService cotizacionService;

    public CotizacionController(CotizacionService cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    @PostMapping
    public ResponseEntity<CotizacionResponseDTO> crear(@Valid @RequestBody CotizacionRequestDTO dto) {
        CotizacionResponseDTO nuevaCotizacion = cotizacionService.crearCotizacion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCotizacion);
    }

    @GetMapping
    public ResponseEntity<List<CotizacionResponseDTO>> listarTodas() {
        return ResponseEntity.ok(cotizacionService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CotizacionResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(cotizacionService.buscarPorId(id));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CotizacionResponseDTO>> listarPorUsuario(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(cotizacionService.listarPorUsuario(usuarioId));
    }
}