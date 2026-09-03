package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.ProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ProductoService {
    ProductoResponseDTO registrar(ProductoRequestDTO dto);
    List<ProductoResponseDTO> listar();
    ProductoResponseDTO buscarPorId(UUID id);
    List<ProductoResponseDTO> listarPorCategoria(UUID categoriaId);
}
