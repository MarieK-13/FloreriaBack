package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RegistroRequestDTO {

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 100, message = "Los nombres no deben superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 100, message = "Los apellidos no deben superar 100 caracteres")
    private String apellidos;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato de email no es válido")
    @Size(max = 150, message = "El email no debe superar 150 caracteres")
    private String email;

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }

    /** Celular peruano: 9 dígitos que empiezan en 9, con o sin +51 y espacios. Ej: +51 987 654 321 */
    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^(\\+?51)?[\\s-]*9([\\s-]*\\d){8}$",
            message = "Ingrese un celular válido de 9 dígitos (ej. 987 654 321)")
    private String telefono;

    /** BCrypt solo usa los primeros 72 bytes, por eso se limita el máximo. */
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 72, message = "La contraseña debe tener entre 6 y 72 caracteres")
    private String contrasena;

    /** El formulario exige marcar "Acepto los términos y la política de privacidad". */
    @AssertTrue(message = "Debe aceptar los términos y la política de privacidad")
    private boolean aceptaTerminos;
}
