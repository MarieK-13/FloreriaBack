package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** PUT /api/auth/me/email. Se pide la contraseña para confirmar que es el dueño de la cuenta. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CambioEmailRequestDTO {

    @NotBlank(message = "El nuevo correo es obligatorio")
    @Email(message = "El formato de email no es válido")
    @Size(max = 150, message = "El email no debe superar 150 caracteres")
    private String nuevoEmail;

    @NotBlank(message = "Ingrese su contraseña actual")
    private String contrasenaActual;
}
