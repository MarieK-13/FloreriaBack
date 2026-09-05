package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.CategoriaRequestDTO;
import com.sistema.FloreriaBack.dto.response.CategoriaResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.CategoriaMapper;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.service.CategoriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoriaServiceImpl implements CategoriaService {
    private final CategoriaRepository repository;
    private final ProductoRepository productoRepository;
    private final CategoriaMapper mapper;

    public CategoriaServiceImpl(CategoriaRepository repository,
            ProductoRepository productoRepository,
            CategoriaMapper mapper) {
        this.repository = repository;
        this.productoRepository = productoRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public CategoriaResponseDTO registrar(CategoriaRequestDTO dto) {
        if (repository.existsByNombre(dto.getNombre())) {
            throw new BusinessRuleException("Ya existe una categoría con ese nombre");
        }
        Categoria guardada = repository.save(mapper.toEntity(dto));
        return mapper.toResponseDTO(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listar() {
        return repository.findAll().stream().map(mapper::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoriaResponseDTO buscarPorId(UUID id) {
        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
        return mapper.toResponseDTO(categoria);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Categoría no encontrada: " + id);
        }
        if (productoRepository.existsByCategoriaId(id)) {
            throw new BusinessRuleException("No se puede eliminar la categoría porque tiene productos asociados");
        }
        repository.deleteById(id);
    }
}
