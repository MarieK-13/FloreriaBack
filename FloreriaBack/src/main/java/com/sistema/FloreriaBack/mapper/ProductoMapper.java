package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.ComponenteProductoDTO;
import com.sistema.FloreriaBack.dto.request.ProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.ComponenteProducto;
import com.sistema.FloreriaBack.model.Producto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductoMapper {

    public Producto toEntity(ProductoRequestDTO dto, Categoria categoria) {
        List<ComponenteProducto> componentes = dto.getComponentes() == null
                ? new ArrayList<>()
                : dto.getComponentes().stream()
                        .map(c -> new ComponenteProducto(c.getCantidad(), c.getDescripcion()))
                        .collect(Collectors.toList());

        return Producto.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .precio(dto.getPrecio())
                .stock(dto.getStock())
                .disponible(dto.getStock() != null && dto.getStock() > 0)
                .color(dto.getColor())
                .tamano(dto.getTamano())
                .imagenUrl(dto.getImagenUrl())
                .ocasiones(dto.getOcasiones() != null ? new HashSet<>(dto.getOcasiones()) : new HashSet<>())
                .componentes(componentes)
                .fechaValidez(dto.getFechaValidez())
                .categoria(categoria)
                .build();
    }

    public ProductoResponseDTO toResponseDTO(Producto p) {
        List<ComponenteProductoDTO> componentesDTO = p.getComponentes() == null
                ? new ArrayList<>()
                : p.getComponentes().stream()
                        .map(c -> new ComponenteProductoDTO(c.getCantidad(), c.getDescripcion()))
                        .collect(Collectors.toList());

        return new ProductoResponseDTO(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getPrecio(),
                p.getStock(),
                p.getDisponible(),
                p.getColor(),
                p.getTamano(),
                p.getImagenUrl(),
                p.getOcasiones() != null ? new HashSet<>(p.getOcasiones()) : new HashSet<>(), componentesDTO,
                p.getFechaValidez(),
                p.getCategoria() != null ? p.getCategoria().getNombre() : null
        );
    }
}