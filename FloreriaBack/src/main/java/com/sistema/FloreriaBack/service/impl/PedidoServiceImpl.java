package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.DetallePedidoRequestDTO;
import com.sistema.FloreriaBack.dto.request.PedidoRequestDTO;
import com.sistema.FloreriaBack.dto.response.PedidoResponseDTO;
import com.sistema.FloreriaBack.dto.response.ReporteVentasDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.PedidoMapper;
import com.sistema.FloreriaBack.model.DetallePedido;
import com.sistema.FloreriaBack.model.Pedido;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import com.sistema.FloreriaBack.repository.PedidoRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.PedidoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final PedidoMapper mapper;

    public PedidoServiceImpl(PedidoRepository pedidoRepository,
                             UsuarioRepository usuarioRepository,
                             ProductoRepository productoRepository,
                             PedidoMapper mapper) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public PedidoResponseDTO crear(PedidoRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getUsuarioId()));

        Pedido pedido = Pedido.builder()
                .fechaPedido(LocalDateTime.now())
                .usuario(usuario)
                .direccionEntrega(dto.getDireccionEntrega())
                .instruccionesEntrega(dto.getInstruccionesEntrega())
                .estado(EstadoPedido.PENDIENTE)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal totalAcumulado = BigDecimal.ZERO;

        for (DetallePedidoRequestDTO itemDto : dto.getDetalles()) {
            Producto producto = productoRepository.findById(itemDto.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + itemDto.getProductoId()));

            if (!Boolean.TRUE.equals(producto.getDisponible()) || producto.getStock() < itemDto.getCantidad()) {
                throw new BusinessRuleException("Stock insuficiente para \"" + producto.getNombre() + "\". Disponible: " + producto.getStock());
            }

            // Descontar stock
            producto.setStock(producto.getStock() - itemDto.getCantidad());
            if (producto.getStock() == 0) {
                producto.setDisponible(false);
            }
            productoRepository.save(producto);

            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(itemDto.getCantidad()));

            DetallePedido detalle = DetallePedido.builder()
                    .producto(producto)
                    .productoNombre(producto.getNombre())
                    .cantidad(itemDto.getCantidad())
                    .precioUnitario(producto.getPrecio())
                    .subtotal(subtotal)
                    .build();

            pedido.addDetalle(detalle);
            totalAcumulado = totalAcumulado.add(subtotal);
        }

        pedido.setTotal(totalAcumulado);
        Pedido guardado = pedidoRepository.save(pedido);
        return mapper.toResponseDTO(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public PedidoResponseDTO buscarPorId(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));
        return mapper.toResponseDTO(pedido);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listar() {
        return pedidoRepository.findAll().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorUsuario(UUID usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId);
        }
        return pedidoRepository.findByUsuarioId(usuarioId).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PedidoResponseDTO cambiarEstado(UUID id, EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));

        // Si se cancela el pedido, restaurar stock
        if (nuevoEstado == EstadoPedido.CANCELADO && pedido.getEstado() != EstadoPedido.CANCELADO) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                Producto producto = detalle.getProducto();
                if (producto != null) {
                    producto.setStock(producto.getStock() + detalle.getCantidad());
                    producto.setDisponible(true);
                    productoRepository.save(producto);
                }
            }
        }

        pedido.setEstado(nuevoEstado);
        return mapper.toResponseDTO(pedidoRepository.save(pedido));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorRangoDeFechas(LocalDate inicio, LocalDate fin) {
        validarRango(inicio, fin);
        return pedidoRepository.buscarPorRangoDeFechas(inicioDelDia(inicio), finDelDia(fin)).stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteVentasDTO reporteDeVentas(LocalDate inicio, LocalDate fin) {
        validarRango(inicio, fin);
        LocalDateTime desde = inicioDelDia(inicio);
        LocalDateTime hasta = finDelDia(fin);

        // Los pedidos cancelados no cuentan como venta
        BigDecimal total = pedidoRepository.sumarVentasEnRango(desde, hasta, EstadoPedido.CANCELADO);
        long cantidad = pedidoRepository.contarPedidosEnRango(desde, hasta, EstadoPedido.CANCELADO);

        return new ReporteVentasDTO(inicio, fin, cantidad, total != null ? total : BigDecimal.ZERO);
    }

    private void validarRango(LocalDate inicio, LocalDate fin) {
        if (inicio == null || fin == null) {
            throw new BusinessRuleException("Debe indicar la fecha de inicio y la fecha de fin");
        }
        if (inicio.isAfter(fin)) {
            throw new BusinessRuleException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
    }

    private LocalDateTime inicioDelDia(LocalDate fecha) {
        return fecha.atStartOfDay();
    }

    private LocalDateTime finDelDia(LocalDate fecha) {
        return fecha.atTime(LocalTime.MAX);
    }
}
