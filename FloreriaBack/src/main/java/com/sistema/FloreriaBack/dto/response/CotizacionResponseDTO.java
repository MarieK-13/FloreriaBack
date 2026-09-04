package com.sistema.FloreriaBack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CotizacionResponseDTO {
    private UUID id;
    private LocalDateTime fechaCreacion;
    private Double total;
    private List<ItemCotizacionResponseDTO> items;
}