package com.sistema.FloreriaBack.service;

import java.util.List;
import java.util.UUID;

import com.sistema.FloreriaBack.dto.request.FechaImportanteRequestDTO;
import com.sistema.FloreriaBack.dto.response.FechaImportanteResponseDTO;

public interface FechaImportanteService {

    List<FechaImportanteResponseDTO> listarMisFechas();

    FechaImportanteResponseDTO crearFecha(FechaImportanteRequestDTO request);

    FechaImportanteResponseDTO actualizarFecha(UUID id, FechaImportanteRequestDTO request);

    FechaImportanteResponseDTO actualizarDiasAnticipacion(UUID id, Integer diasAnticipacion);

    void eliminarFecha(UUID id);
}