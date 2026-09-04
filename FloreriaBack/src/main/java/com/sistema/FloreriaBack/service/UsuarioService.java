package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;

import java.util.List;
import java.util.UUID;

public interface UsuarioService{
    UsuarioResponseDTO registrar(UsuarioRequestDTO dto);
    List<UsuarioResponseDTO> listar();
    UsuarioResponseDTO buscarPorId(UUID id);
}
