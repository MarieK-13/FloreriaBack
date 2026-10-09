package com.sistema.FloreriaBack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ReporteVentasDTO {
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private long cantidadPedidos;
    private BigDecimal totalVendido;
}
