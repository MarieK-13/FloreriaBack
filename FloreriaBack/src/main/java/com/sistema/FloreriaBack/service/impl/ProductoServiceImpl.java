package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.ProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.ProductoMapper;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.ComponenteProducto;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.repository.DetallePedidoRepository;
import com.sistema.FloreriaBack.repository.DetalleProductoRepository;
import com.sistema.FloreriaBack.repository.ItemCotizacionRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.service.ProductoService;
import com.sistema.FloreriaBack.specification.ProductoSpecification;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductoServiceImpl implements ProductoService {

    private static final BigDecimal PRECIO_MAXIMO_POR_DEFECTO = new BigDecimal("99999999.99");

    private final ProductoRepository repository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper mapper;
    private final DetallePedidoRepository detallePedidoRepository;
    private final ItemCotizacionRepository itemCotizacionRepository;
    private final DetalleProductoRepository detalleProductoRepository;

    public ProductoServiceImpl(ProductoRepository repository,
            CategoriaRepository categoriaRepository,
            ProductoMapper mapper,
            DetallePedidoRepository detallePedidoRepository,
            ItemCotizacionRepository itemCotizacionRepository,
            DetalleProductoRepository detalleProductoRepository) {
        this.repository = repository;
        this.categoriaRepository = categoriaRepository;
        this.mapper = mapper;
        this.detallePedidoRepository = detallePedidoRepository;
        this.itemCotizacionRepository = itemCotizacionRepository;
        this.detalleProductoRepository = detalleProductoRepository;
    }

    @Override
    @Transactional
    public ProductoResponseDTO registrar(ProductoRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + dto.getCategoriaId()));
        Producto producto = mapper.toEntity(dto, categoria);
        return mapper.toResponseDTO(repository.save(producto));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listar() {
        return repository.findAllByOrderByFechaCreacionDesc().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> filtrarCatalogo(
            String nombre,
            UUID categoriaId,
            String ocasion,
            String color,
            String tamano,
            BigDecimal precioMax,
            Boolean soloDisponibles,
            String sortBy,
            String sortDir) {

        if (precioMax != null && precioMax.signum() < 0) {
            throw new BusinessRuleException("El precio máximo no puede ser negativo");
        }

        Sort sort;
        if ("precio".equalsIgnoreCase(sortBy)) {
            Sort.Direction direccion = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direccion, "precio");
        } else if ("nombre".equalsIgnoreCase(sortBy)) {
            Sort.Direction direccion = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direccion, "nombre");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "fechaCreacion");
        }
        
        Specification<Producto> spec = ProductoSpecification.conFiltros(
                nombre, categoriaId, ocasion, color, tamano, precioMax, soloDisponibles);

        return repository.findAll(spec, sort).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponseDTO buscarPorId(UUID id) {
        Producto producto = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        return mapper.toResponseDTO(producto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarPorCategoria(UUID categoriaId) {
        return repository.findByCategoriaId(categoriaId).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductoResponseDTO actualizar(UUID id, ProductoRequestDTO dto) {
        Producto producto = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Categoría no encontrada con id: " + dto.getCategoriaId()));

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        producto.setDisponible(dto.getStock() != null && dto.getStock() > 0);
        producto.setColor(dto.getColor());
        producto.setTamano(dto.getTamano());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setCategoria(categoria);

        producto.getOcasiones().clear();
        if (dto.getOcasiones() != null) {
            producto.getOcasiones().addAll(dto.getOcasiones());
        }

        producto.setFechaValidez(dto.getFechaValidez());
        producto.getComponentes().clear();
        if (dto.getComponentes() != null) {
            dto.getComponentes().forEach(
                    c -> producto.getComponentes().add(new ComponenteProducto(c.getCantidad(), c.getDescripcion())));
        }

        return mapper.toResponseDTO(repository.save(producto));
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado: " + id);
        }

        if (detallePedidoRepository.existsByProductoId(id) || itemCotizacionRepository.existsByProductoId(id)) {
            throw new BusinessRuleException(
                    "No se puede eliminar el producto porque tiene pedidos o cotizaciones asociados");
        }

        detalleProductoRepository.findByProductoId(id).ifPresent(ficha -> {
            detalleProductoRepository.delete(ficha);
            detalleProductoRepository.flush();
        });

        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> buscarPorNombreYPrecioMaximo(String nombre, BigDecimal precioMax) {
        if (precioMax != null && precioMax.signum() < 0) {
            throw new BusinessRuleException("El precio máximo no puede ser negativo");
        }
        String texto = nombre == null ? "" : nombre.trim();
        BigDecimal maximo = precioMax == null ? PRECIO_MAXIMO_POR_DEFECTO : precioMax;
        return repository.buscarPorNombreYPrecioMaximo(texto, maximo).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarConStockBajo(Integer limite) {
        if (limite == null || limite < 0) {
            throw new BusinessRuleException("El límite de stock debe ser 0 o mayor");
        }
        return repository.buscarConStockBajo(limite).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}