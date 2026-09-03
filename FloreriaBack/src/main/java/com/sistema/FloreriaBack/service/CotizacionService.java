package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;

public interface CotizacionService {

    CotizacionResponseDTO generarCotizacion(String mensajeUsuario);
}
