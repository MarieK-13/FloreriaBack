package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FechaImportanteRequestDTO {

    @NotBlank(message = "La ocasión es obligatoria")
    @Size(max = 80, message = "La ocasión no puede superar los 80 caracteres")
    private String ocasion;

    @NotBlank(message = "El nombre de la persona es obligatorio")
    @Size(max = 80, message = "El nombre de la persona no puede superar los 80 caracteres")
    private String persona;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    private Integer diasAnticipacion; 
}