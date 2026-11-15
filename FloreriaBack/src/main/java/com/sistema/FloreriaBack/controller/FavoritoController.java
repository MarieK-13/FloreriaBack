package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.service.FavoritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class FavoritoController {

    private final FavoritoService favoritoService;

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listarMisFavoritos(Authentication auth) {
        return ResponseEntity.ok(favoritoService.listarMisFavoritos(auth.getName()));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<UUID>> listarIdsFavoritos(Authentication auth) {
        return ResponseEntity.ok(favoritoService.listarIdsFavoritos(auth.getName()));
    }

    @PostMapping("/{productoId}/toggle")
    public ResponseEntity<List<UUID>> toggleFavorito(
            @PathVariable UUID productoId,
            Authentication auth) {
        return ResponseEntity.ok(favoritoService.toggleFavorito(auth.getName(), productoId));
    }

    @PostMapping("/sincronizar")
    public ResponseEntity<List<UUID>> sincronizarFavoritos(
            @RequestBody List<UUID> productoIds,
            Authentication auth) {
        return ResponseEntity.ok(favoritoService.sincronizarFavoritos(auth.getName(), productoIds));
    }

    @DeleteMapping
    public ResponseEntity<Void> vaciarFavoritos(Authentication auth) {
        favoritoService.vaciarFavoritos(auth.getName());
        return ResponseEntity.noContent().build();
    }
}