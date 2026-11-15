package com.sistema.FloreriaBack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FechaImportanteResponseDTO {

    private UUID id; 
    private String ocasion;
    private String persona;
    private LocalDate fecha;
    private Integer diasAnticipacion;
    private LocalDateTime fechaCreacion;
}