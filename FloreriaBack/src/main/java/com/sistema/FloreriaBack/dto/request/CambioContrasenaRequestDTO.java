package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** PUT /api/auth/me/contrasena */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CambioContrasenaRequestDTO {

    @NotBlank(message = "Ingrese su contraseña actual")
    private String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, max = 72, message = "La contraseña debe tener entre 6 y 72 caracteres")
    private String nuevaContrasena;

    @NotBlank(message = "Confirme la nueva contraseña")
    private String confirmacion;
}
