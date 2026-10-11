package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.*;

/**
 * Datos para actualizar una ficha técnica. No incluye productoId:
 * una ficha pertenece siempre al mismo producto (relación uno a uno).
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetalleProductoUpdateRequestDTO {

    private String cuidados;

    @Positive(message = "La duración debe ser mayor a 0")
    private Integer duracionDias;

    private String materiales;

    private String ocasion;

    private String instruccionesEntrega;
}
