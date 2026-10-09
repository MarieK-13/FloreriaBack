package com.sistema.FloreriaBack.dto.response;

import com.sistema.FloreriaBack.model.enums.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String tipo;          // siempre "Bearer"
    private long expiraEnMs;
    private UUID usuarioId;
    private String nombre;
    private String email;
    private RolUsuario rol;
}
