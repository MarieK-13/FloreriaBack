package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.response.DetallePedidoResponseDTO;
import com.sistema.FloreriaBack.dto.response.PedidoResponseDTO;
import com.sistema.FloreriaBack.model.DetallePedido;
import com.sistema.FloreriaBack.model.Pedido;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PedidoMapper {

    public DetallePedidoResponseDTO toDetalleResponseDTO(DetallePedido d) {
        if (d == null) return null;
        return new DetallePedidoResponseDTO(
                d.getId(),
                d.getProducto() != null ? d.getProducto().getId() : null,
                d.getProductoNombre(),
                d.getCantidad(),
                d.getPrecioUnitario(),
                d.getSubtotal()
        );
    }

    public PedidoResponseDTO toResponseDTO(Pedido p) {
        if (p == null) return null;
        List<DetallePedidoResponseDTO> detallesDTO = p.getDetalles() != null
                ? p.getDetalles().stream().map(this::toDetalleResponseDTO).collect(Collectors.toList())
                : Collections.emptyList();

        return new PedidoResponseDTO(
                p.getId(),
                p.getFechaPedido(),
                p.getTotal(),
                p.getDireccionEntrega(),
                p.getInstruccionesEntrega(),
                p.getEstado(),
                p.getUsuario() != null ? p.getUsuario().getId() : null,
                p.getUsuario() != null ? p.getUsuario().getNombre() : null,
                detallesDTO
        );
    }
}
