package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.ProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductoResponseDTO> registrar(@Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(dto));
    }

    @GetMapping
    public List<ProductoResponseDTO> listar() { return service.listar(); }

    /** Público. Ej: GET /api/productos/buscar?nombre=rosa&precioMax=80 (ambos parámetros opcionales) */
    @GetMapping("/buscar")
    public List<ProductoResponseDTO> buscar(@RequestParam(defaultValue = "") String nombre,
                                            @RequestParam(required = false) BigDecimal precioMax) {
        return service.buscarPorNombreYPrecioMaximo(nombre, precioMax);
    }

    /** ADMINISTRADOR u OPERARIO. Ej: GET /api/productos/stock-bajo?limite=5 */
    @GetMapping("/stock-bajo")
    public List<ProductoResponseDTO> stockBajo(@RequestParam(defaultValue = "5") Integer limite) {
        return service.listarConStockBajo(limite);
    }

    @GetMapping("/{id}")
    public ProductoResponseDTO buscarPorId(@PathVariable UUID id) { return service.buscarPorId(id); }

    @GetMapping("/categoria/{categoriaId}")
    public List<ProductoResponseDTO> listarPorCategoria(@PathVariable UUID categoriaId) {
        return service.listarPorCategoria(categoriaId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> actualizar(@PathVariable UUID id, @Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(service.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
