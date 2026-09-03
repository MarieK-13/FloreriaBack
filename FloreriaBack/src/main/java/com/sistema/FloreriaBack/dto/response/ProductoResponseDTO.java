package com.sistema.FloreriaBack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class ProductoResponseDTO {
    private UUID id;
    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private Boolean disponible;
    private String color;
    private String tamano;
    private String categoriaNombre;
}
