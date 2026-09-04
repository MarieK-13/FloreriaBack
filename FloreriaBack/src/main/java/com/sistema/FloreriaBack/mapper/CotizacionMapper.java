package com.sistema.FloreriaBack.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import com.sistema.FloreriaBack.dto.response.ItemCotizacionResponseDTO;
import com.sistema.FloreriaBack.model.Cotizacion;
import com.sistema.FloreriaBack.model.ItemCotizacion;

import org.springframework.stereotype.Component;

@Component
public class CotizacionMapper {

    public CotizacionResponseDTO toResponseDTO(Cotizacion entity) {
        if (entity == null) return null;

        List<ItemCotizacionResponseDTO> itemsDTO = (entity.getItems() != null)
                ? entity.getItems().stream().map(this::toItemResponseDTO).collect(Collectors.toList())
                : Collections.emptyList();

        return new CotizacionResponseDTO(
                entity.getId(),
                entity.getFechaCreacion(),
                entity.getTotal(),
                entity.getMensajeCliente(),
                entity.getPresupuesto(),
                entity.getEstado(),
                itemsDTO);
    }

    private ItemCotizacionResponseDTO toItemResponseDTO(ItemCotizacion entity) {
        return new ItemCotizacionResponseDTO(
                entity.getProductoNombre(),
                entity.getCantidad(),
                entity.getPrecioUnitario(),
                entity.getSubtotal());
    }
}