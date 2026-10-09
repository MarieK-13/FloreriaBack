package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.PedidoRequestDTO;
import com.sistema.FloreriaBack.dto.response.PedidoResponseDTO;
import com.sistema.FloreriaBack.dto.response.ReporteVentasDTO;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import com.sistema.FloreriaBack.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    /** Un CLIENTE solo puede crear pedidos a su nombre; ADMINISTRADOR/OPERARIO para cualquiera. */
    @PostMapping
    @PreAuthorize("@seguridad.puedeActuarComo(#dto.usuarioId)")
    public ResponseEntity<PedidoResponseDTO> crear(@Valid @RequestBody PedidoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crear(dto));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listar() {
        return ResponseEntity.ok(pedidoService.listar());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@seguridad.puedeVerPedido(#id)")
    public ResponseEntity<PedidoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("@seguridad.puedeActuarComo(#usuarioId)")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorUsuario(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioId));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoResponseDTO> cambiarEstado(@PathVariable UUID id,
                                                           @RequestParam EstadoPedido nuevoEstado) {
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, nuevoEstado));
    }

    /** Solo ADMINISTRADOR. Ej: GET /api/pedidos/reportes/rango?inicio=2026-10-01&fin=2026-10-31 */
    @GetMapping("/reportes/rango")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorRangoDeFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(pedidoService.listarPorRangoDeFechas(inicio, fin));
    }

    /** Solo ADMINISTRADOR. Ej: GET /api/pedidos/reportes/ventas?inicio=2026-10-01&fin=2026-10-31 */
    @GetMapping("/reportes/ventas")
    public ResponseEntity<ReporteVentasDTO> reporteDeVentas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(pedidoService.reporteDeVentas(inicio, fin));
    }
}
