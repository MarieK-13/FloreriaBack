package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.request.ProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.Producto;
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {

    public Producto toEntity(ProductoRequestDTO dto, Categoria categoria) {
        return Producto.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .precio(dto.getPrecio())
                .stock(dto.getStock())
                .disponible(dto.getStock() != null && dto.getStock() > 0)
                .color(dto.getColor())
                .tamano(dto.getTamano())
                .categoria(categoria)
                .build();
    }

    public ProductoResponseDTO toResponseDTO(Producto p) {
        return new ProductoResponseDTO(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getPrecio(),
                p.getStock(),
                p.getDisponible(),
                p.getColor(),
                p.getTamano(),
                p.getCategoria() != null ? p.getCategoria().getNombre() : null
        );
    }
}