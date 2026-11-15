package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.sistema.FloreriaBack.dto.ComponenteProductoDTO;

@Data
public class ProductoRequestDTO {
    @NotBlank(message = "El nombre del producto es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    private String color;
    private String tamano;
    private String imagenUrl;
    private Set<String> ocasiones;

    @NotNull(message = "Debe indicar la categoría")
    private UUID categoriaId;

    private List<ComponenteProductoDTO> componentes;
    private LocalDate fechaValidez;
}