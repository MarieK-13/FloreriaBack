package com.sistema.FloreriaBack.dto.request;

import com.sistema.FloreriaBack.model.enums.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Datos para actualizar un usuario (solo ADMINISTRADOR).
 * La contraseña es opcional: si no se envía o llega vacía, se conserva la actual.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioUpdateRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no debe superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato de email no es válido")
    @Size(max = 150, message = "El email no debe superar 150 caracteres")
    private String email;

    @NotNull(message = "Debe indicar el rol")
    private RolUsuario rol;

    // Se usa @Pattern y no @Size(min = 6) porque @Size rechazaría la cadena vacía,
    // y aquí vacía significa "no cambiar la contraseña". Acepta: vacía o 6+ caracteres.
    @Pattern(regexp = "^$|^.{6,}$", message = "La contraseña debe tener al menos 6 caracteres")
    private String contrasena;
}
