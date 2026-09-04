package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CotizacionRequestDTO {

    private UUID usuarioId;

    private String mensajeCliente;

    private BigDecimal presupuesto;

    @NotEmpty(message = "La cotización debe incluir al menos un producto")
    private List<ItemCotizacionRequestDTO> items;
}