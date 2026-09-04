package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CategoriaRequestDTO {
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 50, message = "El nombre no debe superar 50 caracteres")
    private String nombre;

    @Size(max = 200, message = "La descripción no debe superar 200 caracteres")
    private String descripcion;
}
