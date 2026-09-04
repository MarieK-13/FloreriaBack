package com.sistema.FloreriaBack.dto.response;

import com.sistema.FloreriaBack.model.enums.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class UsuarioResponseDTO {
    private UUID id;
    private String nombre;
    private String email;
    private RolUsuario rol;
    private boolean activo;
}
