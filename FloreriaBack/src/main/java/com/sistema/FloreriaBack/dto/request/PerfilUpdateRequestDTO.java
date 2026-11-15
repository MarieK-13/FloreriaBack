package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Datos personales que el usuario edita en "Mi cuenta" (PUT /api/auth/me). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilUpdateRequestDTO {

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 100, message = "Los nombres no deben superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 100, message = "Los apellidos no deben superar 100 caracteres")
    private String apellidos;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^(\\+?51)?[\\s-]*9([\\s-]*\\d){8}$",
            message = "Ingrese un celular válido de 9 dígitos (ej. 987 654 321)")
    private String telefono;

    @Size(max = 100, message = "El distrito no debe superar 100 caracteres")
    private String distrito;

    @Size(max = 200, message = "La dirección no debe superar 200 caracteres")
    private String direccion;
}
