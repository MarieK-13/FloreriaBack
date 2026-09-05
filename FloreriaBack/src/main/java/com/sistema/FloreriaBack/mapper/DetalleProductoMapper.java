package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.request.DetalleProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.DetalleProductoResponseDTO;
import com.sistema.FloreriaBack.model.DetalleProducto;
import com.sistema.FloreriaBack.model.Producto;
import org.springframework.stereotype.Component;

@Component
public class DetalleProductoMapper {

    public DetalleProducto toEntity(DetalleProductoRequestDTO dto, Producto producto) {
        return DetalleProducto.builder()
                .producto(producto)
                .cuidados(dto.getCuidados())
                .duracionDias(dto.getDuracionDias())
                .materiales(dto.getMateriales())
                .ocasion(dto.getOcasion())
                .instruccionesEntrega(dto.getInstruccionesEntrega())
                .build();
    }

    public DetalleProductoResponseDTO toResponseDTO(DetalleProducto d) {
        return new DetalleProductoResponseDTO(
                d.getId(),
                d.getProducto() != null ? d.getProducto().getId() : null,
                d.getProducto() != null ? d.getProducto().getNombre() : null,
                d.getCuidados(),
                d.getDuracionDias(),
                d.getMateriales(),
                d.getOcasion(),
                d.getInstruccionesEntrega()
        );
    }
}
