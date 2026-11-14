package com.sistema.FloreriaBack.dto.response;

import com.sistema.FloreriaBack.dto.ComponenteProductoDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ProductoResponseDTO {
    private UUID id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;
    private Boolean disponible;
    private String color;
    private String tamano;
    private String imagenUrl;
    private Set<String> ocasiones;
    private List<ComponenteProductoDTO> componentes;
    private LocalDate fechaValidez;
    private String categoriaNombre;
}