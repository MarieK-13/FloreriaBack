package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.request.UsuarioUpdateRequestDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;

import java.util.List;
import java.util.UUID;

public interface UsuarioService{
    UsuarioResponseDTO registrar(UsuarioRequestDTO dto);
    List<UsuarioResponseDTO> listar();
    UsuarioResponseDTO buscarPorId(UUID id);

    /**
     * @param idUsuarioActual ID del administrador que hace la petición, para impedir que se quite su propio rol.
     */
    UsuarioResponseDTO actualizar(UUID id, UsuarioUpdateRequestDTO dto, UUID idUsuarioActual);

    /**
     * Activa o desactiva una cuenta. Es el "delete" del módulo: no se borra físicamente
     * porque el usuario tiene pedidos y cotizaciones asociados.
     * @param idUsuarioActual ID del administrador que hace la petición, para impedir que se desactive a sí mismo.
     */
    UsuarioResponseDTO cambiarEstado(UUID id, boolean activo, UUID idUsuarioActual);
}
