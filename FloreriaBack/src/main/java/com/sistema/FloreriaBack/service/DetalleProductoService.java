package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.DetalleProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.DetalleProductoResponseDTO;
import java.util.List;
import java.util.UUID;

public interface DetalleProductoService {
    DetalleProductoResponseDTO registrar(DetalleProductoRequestDTO dto);
    List<DetalleProductoResponseDTO> listar();
    DetalleProductoResponseDTO buscarPorId(UUID id);
    DetalleProductoResponseDTO buscarPorProducto(UUID productoId);
}
