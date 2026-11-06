package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CotizacionRequestDTO {

    @NotNull(message = "El ID del usuario es obligatorio")
    private UUID usuarioId;

    @Size(max = 500, message = "El mensaje no debe superar 500 caracteres")
    private String mensajeCliente;

    @Positive(message = "El presupuesto debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "El presupuesto admite hasta 8 enteros y 2 decimales")
    private BigDecimal presupuesto;

    @NotEmpty(message = "La cotización debe incluir al menos un producto")
    @Valid
    private List<ItemCotizacionRequestDTO> items;
}
