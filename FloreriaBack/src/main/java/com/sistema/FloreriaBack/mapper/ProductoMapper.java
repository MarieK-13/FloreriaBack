package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.request.ProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {
    private final CategoriaRepository categoriaRepository;

    public ProductoMapper(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public Producto toEntity(ProductoRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + dto.getCategoriaId()));

        return new Producto(null, dto.getNombre(), dto.getDescripcion(), dto.getPrecio(),
                dto.getStock(), dto.getStock() > 0, dto.getColor(), dto.getTamano(), categoria);
    }

    public ProductoResponseDTO toResponseDTO(Producto p) {
        return new ProductoResponseDTO(p.getId(), p.getNombre(), p.getDescripcion(), p.getPrecio(),
                p.getStock(), p.getDisponible(), p.getColor(), p.getTamano(), p.getCategoria().getNombre());
    }
}
