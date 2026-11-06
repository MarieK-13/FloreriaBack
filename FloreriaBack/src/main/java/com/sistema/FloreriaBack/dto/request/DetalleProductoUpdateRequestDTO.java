package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetalleProductoUpdateRequestDTO {

    @NotBlank(message = "Los cuidados son obligatorios")
    private String cuidados;

    @NotNull(message = "La duración en días es obligatoria")
    @Positive(message = "La duración debe ser mayor a 0")
    private Integer duracionDias;

    @Size(max = 255, message = "Los materiales no deben superar 255 caracteres")
    private String materiales;

    @Size(max = 255, message = "La ocasión no debe superar 255 caracteres")
    private String ocasion;

    private String instruccionesEntrega;
}
