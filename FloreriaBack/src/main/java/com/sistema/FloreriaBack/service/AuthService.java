package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.LoginRequestDTO;
import com.sistema.FloreriaBack.dto.request.RegistroRequestDTO;
import com.sistema.FloreriaBack.dto.response.AuthResponseDTO;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO dto);
    AuthResponseDTO registrar(RegistroRequestDTO dto);

    /** Genera un token nuevo para el usuario con ese email (se usa tras registrarse o cambiar de correo). */
    AuthResponseDTO generarSesion(String email);
}
