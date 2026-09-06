package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.DetallePedidoRequestDTO;
import com.sistema.FloreriaBack.dto.request.PedidoRequestDTO;
import com.sistema.FloreriaBack.dto.response.PedidoResponseDTO;
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
import com.sistema.FloreriaBack.service.impl.PedidoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProductoRepository productoRepository;

    private PedidoMapper pedidoMapper;
    private PedidoServiceImpl pedidoService;

    private Usuario usuario;
    private Producto producto;
    private Pedido pedido;
    private PedidoRequestDTO requestDTO;
    private UUID pedidoId;
    private UUID usuarioId;
    private UUID productoId;

    @BeforeEach
    void setUp() {
        pedidoMapper = new PedidoMapper();
        pedidoService = new PedidoServiceImpl(
                pedidoRepository,
                usuarioRepository,
                productoRepository,
                pedidoMapper
        );

        pedidoId = UUID.randomUUID();
        usuarioId = UUID.randomUUID();
        productoId = UUID.randomUUID();

        usuario = Usuario.builder()
                .id(usuarioId)
                .nombre("Carlos Mendoza")
                .email("carlos@example.com")
                .build();

        producto = Producto.builder()
                .id(productoId)
                .nombre("Tulipanes Amarillos")
                .precio(new BigDecimal("30.00"))
                .stock(10)
                .disponible(true)
                .build();

        DetallePedidoRequestDTO detalleDto = new DetallePedidoRequestDTO(productoId, 2);

        requestDTO = new PedidoRequestDTO();
        requestDTO.setUsuarioId(usuarioId);
        requestDTO.setDireccionEntrega("Av. Principal 123");
        requestDTO.setInstruccionesEntrega("Dejar en recepción");
        requestDTO.setDetalles(List.of(detalleDto));

        DetallePedido detalle = DetallePedido.builder()
                .id(UUID.randomUUID())
                .producto(producto)
                .productoNombre("Tulipanes Amarillos")
                .cantidad(2)
                .precioUnitario(new BigDecimal("30.00"))
                .subtotal(new BigDecimal("60.00"))
                .build();

        pedido = Pedido.builder()
                .id(pedidoId)
                .fechaPedido(LocalDateTime.now())
                .usuario(usuario)
                .direccionEntrega("Av. Principal 123")
                .instruccionesEntrega("Dejar en recepción")
                .estado(EstadoPedido.PENDIENTE)
                .total(new BigDecimal("60.00"))
                .detalles(new ArrayList<>(List.of(detalle)))
                .build();

        detalle.setPedido(pedido);
    }

    @Test
    @DisplayName("Debe crear un pedido exitosamente y descontar el stock del producto")
    void crear_Exitoso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedido);

        PedidoResponseDTO resultado = pedidoService.crear(requestDTO);

        assertNotNull(resultado);
        assertEquals(pedidoId, resultado.getId());
        assertEquals(new BigDecimal("60.00"), resultado.getTotal());
        assertEquals(EstadoPedido.PENDIENTE, resultado.getEstado());

        verify(usuarioRepository, times(1)).findById(usuarioId);
        verify(productoRepository, times(1)).findById(productoId);
        verify(productoRepository, times(1)).save(producto);
        verify(pedidoRepository, times(1)).save(any(Pedido.class));
        assertEquals(8, producto.getStock());
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el usuario no existe")
    void crear_UsuarioNoEncontrado_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> pedidoService.crear(requestDTO));

        verify(pedidoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si un producto del pedido no existe")
    void crear_ProductoNoEncontrado_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(productoId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> pedidoService.crear(requestDTO));

        verify(pedidoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException cuando el stock es insuficiente")
    void crear_StockInsuficiente_LanzaExcepcion() {
        producto.setStock(1); // Solicitó 2
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> pedidoService.crear(requestDTO));

        assertTrue(ex.getMessage().contains("Stock insuficiente"));
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe buscar un pedido por ID exitosamente")
    void buscarPorId_Exitoso() {
        when(pedidoRepository.findById(pedidoId)).thenReturn(Optional.of(pedido));

        PedidoResponseDTO resultado = pedidoService.buscarPorId(pedidoId);

        assertNotNull(resultado);
        assertEquals(pedidoId, resultado.getId());

        verify(pedidoRepository, times(1)).findById(pedidoId);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al buscar por ID inexistente")
    void buscarPorId_NoEncontrado_LanzaExcepcion() {
        when(pedidoRepository.findById(pedidoId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> pedidoService.buscarPorId(pedidoId));

        verify(pedidoRepository, times(1)).findById(pedidoId);
    }

    @Test
    @DisplayName("Debe listar todos los pedidos")
    void listar_Exitoso() {
        when(pedidoRepository.findAll()).thenReturn(List.of(pedido));

        List<PedidoResponseDTO> resultado = pedidoService.listar();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());

        verify(pedidoRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe listar pedidos por usuario exitosamente")
    void listarPorUsuario_Exitoso() {
        when(usuarioRepository.existsById(usuarioId)).thenReturn(true);
        when(pedidoRepository.findByUsuarioId(usuarioId)).thenReturn(List.of(pedido));

        List<PedidoResponseDTO> resultado = pedidoService.listarPorUsuario(usuarioId);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());

        verify(usuarioRepository, times(1)).existsById(usuarioId);
        verify(pedidoRepository, times(1)).findByUsuarioId(usuarioId);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al listar pedidos de un usuario inexistente")
    void listarPorUsuario_UsuarioNoEncontrado_LanzaExcepcion() {
        when(usuarioRepository.existsById(usuarioId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> pedidoService.listarPorUsuario(usuarioId));

        verify(pedidoRepository, never()).findByUsuarioId(any());
    }

    @Test
    @DisplayName("Debe cambiar el estado del pedido a CANCELADO y restaurar el stock del producto")
    void cambiarEstado_Cancelado_RestauraStock() {
        when(pedidoRepository.findById(pedidoId)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedido);

        PedidoResponseDTO resultado = pedidoService.cambiarEstado(pedidoId, EstadoPedido.CANCELADO);

        assertNotNull(resultado);
        verify(productoRepository, times(1)).save(producto);
        assertEquals(12, producto.getStock()); // 10 original + 2 devueltos al cancelar
    }
}
