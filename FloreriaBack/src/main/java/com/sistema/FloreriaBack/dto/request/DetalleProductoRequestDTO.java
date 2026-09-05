package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetalleProductoRequestDTO {

    @NotNull(message = "El producto es obligatorio")
    private UUID productoId;

    private String cuidados;

    @Positive(message = "La duración debe ser mayor a 0")
    private Integer duracionDias;

    private String materiales;

    private String ocasion;

    private String instruccionesEntrega;
}
