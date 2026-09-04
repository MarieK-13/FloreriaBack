package com.sistema.FloreriaBack.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.sistema.FloreriaBack.model.enums.EstadoCotizacion;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CotizacionResponseDTO {
    private UUID id;
    private LocalDateTime fechaCreacion;
    private BigDecimal total;
    private String mensajeCliente;
    private BigDecimal presupuesto;
    private EstadoCotizacion estado;
    private List<ItemCotizacionResponseDTO> items;
}