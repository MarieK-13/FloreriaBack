package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.CategoriaRequestDTO;
import com.sistema.FloreriaBack.dto.response.CategoriaResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.CategoriaMapper;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.service.CategoriaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoriaServiceImpl implements CategoriaService {
    private final CategoriaRepository repository;
    private final CategoriaMapper mapper;

    public CategoriaServiceImpl(CategoriaRepository repository, CategoriaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public CategoriaResponseDTO registrar(CategoriaRequestDTO dto) {
        if (repository.existsByNombre(dto.getNombre())) {
            throw new BusinessRuleException("Ya existe una categoría con ese nombre");
        }
        Categoria guardada = repository.save(mapper.toEntity(dto));
        return mapper.toResponseDTO(guardada);
    }

    @Override
    public List<CategoriaResponseDTO> listar() {
        return repository.findAll().stream().map(mapper::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public CategoriaResponseDTO buscarPorId(UUID id) {
        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
        return mapper.toResponseDTO(categoria);
    }

    @Override
    public void eliminar(UUID id) {
        buscarPorId(id);
        repository.deleteById(id);
    }
}
