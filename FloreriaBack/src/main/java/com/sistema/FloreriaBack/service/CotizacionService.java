package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.CotizacionRequestDTO;
import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import java.util.List;
import java.util.UUID;

public interface CotizacionService {
    CotizacionResponseDTO crearCotizacion(CotizacionRequestDTO dto);
    CotizacionResponseDTO buscarPorId(UUID id);
    List<CotizacionResponseDTO> listarTodas();
    List<CotizacionResponseDTO> listarPorUsuario(UUID usuarioId);
}