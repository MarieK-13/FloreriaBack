package com.sistema.FloreriaBack.service;

import java.util.List;
import java.util.UUID;

import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;

public interface FavoritoService {

    List<ProductoResponseDTO> listarMisFavoritos(String email);

    List<UUID> listarIdsFavoritos(String email);

    List<UUID> toggleFavorito(String email, UUID productoId);

    List<UUID> sincronizarFavoritos(String email, List<UUID> productoIds);

    void vaciarFavoritos(String email);
}