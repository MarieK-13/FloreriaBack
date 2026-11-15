package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DELETE /api/auth/me. Se pide la contraseña para evitar eliminaciones por error. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EliminarCuentaRequestDTO {

    @NotBlank(message = "Ingrese su contraseña para confirmar")
    private String contrasena;
}
