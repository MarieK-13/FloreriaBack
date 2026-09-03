package com.sistema.FloreriaBack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CategoriaResponseDTO {
    private UUID id;
    private String nombre;
    private String descripcion;
}
