package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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

    private String materiales;

    private String ocasion;

    private String instruccionesEntrega;
}
