package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import java.util.List;
import java.util.UUID;

public interface CotizacionService {
    CotizacionResponseDTO generarCotizacion(String mensajeUsuario);
    CotizacionResponseDTO obtenerPorId(UUID id);
    List<CotizacionResponseDTO> listarTodas();
}