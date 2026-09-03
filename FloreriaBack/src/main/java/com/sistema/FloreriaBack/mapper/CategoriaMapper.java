package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.request.CategoriaRequestDTO;
import com.sistema.FloreriaBack.dto.response.CategoriaResponseDTO;
import com.sistema.FloreriaBack.model.Categoria;
import org.springframework.stereotype.Component;

@Component
public class CategoriaMapper {
    public Categoria toEntity(CategoriaRequestDTO dto) {
        return new Categoria(null, dto.getNombre(), dto.getDescripcion());
    }

    public CategoriaResponseDTO toResponseDTO(Categoria categoria) {
        return new CategoriaResponseDTO(categoria.getId(), categoria.getNombre(), categoria.getDescripcion());
    }
}
