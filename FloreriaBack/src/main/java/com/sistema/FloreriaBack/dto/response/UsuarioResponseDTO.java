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
    private String apellidos;
    private String email;
    private String telefono;
    private String distrito;
    private String direccion;
    private RolUsuario rol;
    private boolean activo;

    /** Constructor solo con los datos básicos (lo usan las pruebas anteriores). */
    public UsuarioResponseDTO(UUID id, String nombre, String email, RolUsuario rol, boolean activo) {
        this(id, nombre, null, email, null, null, null, rol, activo);
    }
}
