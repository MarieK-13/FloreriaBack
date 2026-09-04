package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.CotizacionRequestDTO;
import com.sistema.FloreriaBack.dto.request.ItemCotizacionRequestDTO;
import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.CotizacionMapper;
import com.sistema.FloreriaBack.model.Cotizacion;
import com.sistema.FloreriaBack.model.ItemCotizacion;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.EstadoCotizacion;
import com.sistema.FloreriaBack.repository.CotizacionRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.CotizacionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CotizacionServiceImpl implements CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final CotizacionMapper cotizacionMapper;

    public CotizacionServiceImpl(CotizacionRepository cotizacionRepository,
                                  UsuarioRepository usuarioRepository,
                                  ProductoRepository productoRepository,
                                  CotizacionMapper cotizacionMapper) {
        this.cotizacionRepository = cotizacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.cotizacionMapper = cotizacionMapper;
    }

    @Override
    @Transactional
    public CotizacionResponseDTO crearCotizacion(CotizacionRequestDTO dto) {
        Usuario usuario = null;
        if (dto.getUsuarioId() != null) {
            usuario = usuarioRepository.findById(dto.getUsuarioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getUsuarioId()));
        }

        Cotizacion cotizacion = Cotizacion.builder()
                .fechaCreacion(LocalDateTime.now())
                .usuario(usuario)
                .mensajeCliente(dto.getMensajeCliente())
                .presupuesto(dto.getPresupuesto())
                .estado(EstadoCotizacion.PENDIENTE)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal totalAcumulado = BigDecimal.ZERO;

        for (ItemCotizacionRequestDTO itemDto : dto.getItems()) {
            Producto producto = productoRepository.findById(itemDto.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto no encontrado: " + itemDto.getProductoId()));

            if (!Boolean.TRUE.equals(producto.getDisponible()) || producto.getStock() < itemDto.getCantidad()) {
                throw new BusinessRuleException(
                        "Stock insuficiente para \"" + producto.getNombre() + "\". Disponible: " + producto.getStock());
            }

            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(itemDto.getCantidad()));

            ItemCotizacion item = ItemCotizacion.builder()
                    .producto(producto)
                    .productoNombre(producto.getNombre())   // snapshot real, no del cliente
                    .cantidad(itemDto.getCantidad())
                    .precioUnitario(producto.getPrecio())   // precio real, no el del cliente
                    .subtotal(subtotal)
                    .build();

            cotizacion.addItem(item);
            totalAcumulado = totalAcumulado.add(subtotal);
        }

        if (dto.getPresupuesto() != null && totalAcumulado.compareTo(dto.getPresupuesto()) > 0) {
            throw new BusinessRuleException(
                    "El total de la cotización (S/ " + totalAcumulado + ") supera el presupuesto indicado (S/ " + dto.getPresupuesto() + ")");
        }

        cotizacion.setTotal(totalAcumulado);
        Cotizacion guardada = cotizacionRepository.save(cotizacion);
        return cotizacionMapper.toResponseDTO(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public CotizacionResponseDTO buscarPorId(UUID id) {
        Cotizacion cotizacion = cotizacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización no encontrada con ID: " + id));
        return cotizacionMapper.toResponseDTO(cotizacion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CotizacionResponseDTO> listarTodas() {
        return cotizacionRepository.findAll().stream()
                .map(cotizacionMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CotizacionResponseDTO> listarPorUsuario(UUID usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId);
        }
        return cotizacionRepository.findByUsuarioId(usuarioId).stream()
                .map(cotizacionMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}