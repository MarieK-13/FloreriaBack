package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.DetalleProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.DetalleProductoResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.DetalleProductoMapper;
import com.sistema.FloreriaBack.model.DetalleProducto;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.repository.DetalleProductoRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.service.DetalleProductoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DetalleProductoServiceImpl implements DetalleProductoService {

    private final DetalleProductoRepository repository;
    private final ProductoRepository productoRepository;
    private final DetalleProductoMapper mapper;

    public DetalleProductoServiceImpl(DetalleProductoRepository repository,
                                      ProductoRepository productoRepository,
                                      DetalleProductoMapper mapper) {
        this.repository = repository;
        this.productoRepository = productoRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public DetalleProductoResponseDTO registrar(DetalleProductoRequestDTO dto) {
        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + dto.getProductoId()));

        if (repository.existsByProductoId(dto.getProductoId())) {
            throw new BusinessRuleException("El producto ya tiene un detalle registrado: " + dto.getProductoId());
        }

        DetalleProducto detalle = mapper.toEntity(dto, producto);
        return mapper.toResponseDTO(repository.save(detalle));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DetalleProductoResponseDTO> listar() {
        return repository.findAll().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DetalleProductoResponseDTO buscarPorId(UUID id) {
        DetalleProducto detalle = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detalle de producto no encontrado: " + id));
        return mapper.toResponseDTO(detalle);
    }

    @Override
    @Transactional(readOnly = true)
    public DetalleProductoResponseDTO buscarPorProducto(UUID productoId) {
        DetalleProducto detalle = repository.findByProductoId(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("El producto no tiene detalle registrado: " + productoId));
        return mapper.toResponseDTO(detalle);
    }
}
