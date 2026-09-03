package com.sistema.FloreriaBack.mapper;

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

        CotizacionResponseDTO dto = new CotizacionResponseDTO();
        dto.setId(entity.getId());
        dto.setFechaCreacion(entity.getFechaCreacion());
        dto.setTotal(entity.getTotal());

        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                    .map(this::itemToResponseDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private ItemCotizacionResponseDTO itemToResponseDTO(ItemCotizacion item) {
        ItemCotizacionResponseDTO dto = new ItemCotizacionResponseDTO();
        dto.setProductoNombre(item.getProductoNombre());
        dto.setCantidad(item.getCantidad());
        dto.setPrecioUnitario(item.getPrecioUnitario());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
    


}
