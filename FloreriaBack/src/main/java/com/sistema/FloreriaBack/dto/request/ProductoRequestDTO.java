package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductoRequestDTO {
    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 255, message = "El nombre no debe superar 255 caracteres")
    private String nombre;

    @Size(max = 255, message = "La descripción no debe superar 255 caracteres")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "El precio admite hasta 8 enteros y 2 decimales")
    private BigDecimal precio;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    @Size(max = 255, message = "El color no debe superar 255 caracteres")
    private String color;

    @Size(max = 255, message = "El tamaño no debe superar 255 caracteres")
    private String tamano;

    @NotNull(message = "Debe indicar la categoría")
    private UUID categoriaId;
}