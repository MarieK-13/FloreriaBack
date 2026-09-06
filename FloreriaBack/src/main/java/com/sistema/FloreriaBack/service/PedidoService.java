package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.PedidoRequestDTO;
import com.sistema.FloreriaBack.dto.response.PedidoResponseDTO;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;

import java.util.List;
import java.util.UUID;

public interface PedidoService {
    PedidoResponseDTO crear(PedidoRequestDTO dto);
    PedidoResponseDTO buscarPorId(UUID id);
    List<PedidoResponseDTO> listar();
    List<PedidoResponseDTO> listarPorUsuario(UUID usuarioId);
    PedidoResponseDTO cambiarEstado(UUID id, EstadoPedido nuevoEstado);
}
