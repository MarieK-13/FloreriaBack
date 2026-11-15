package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginRequestDTO {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato de email no es válido")
    private String email;

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }

    @NotBlank(message = "La contraseña es obligatoria")
    private String contrasena;
}
