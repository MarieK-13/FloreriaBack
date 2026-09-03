package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.CategoriaRequestDTO;
import com.sistema.FloreriaBack.dto.response.CategoriaResponseDTO;

import java.util.List;
import java.util.UUID;

public interface CategoriaService {
    CategoriaResponseDTO registrar(CategoriaRequestDTO dto);
    List<CategoriaResponseDTO> listar();
    CategoriaResponseDTO buscarPorId(UUID id);
    void eliminar(UUID id);
}
