package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.CotizacionRequestDTO;
import com.sistema.FloreriaBack.dto.request.ItemCotizacionRequestDTO;
import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.CotizacionMapper;
import com.sistema.FloreriaBack.model.Cotizacion;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.EstadoCotizacion;
import com.sistema.FloreriaBack.repository.CotizacionRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.impl.CotizacionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
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
class CotizacionServiceTest {

    @Mock
    private CotizacionRepository cotizacionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CotizacionMapper cotizacionMapper;

    @InjectMocks
    private CotizacionServiceImpl cotizacionService;

    private Usuario usuario;
    private Producto producto;
    private Cotizacion cotizacion;
    private CotizacionRequestDTO requestDTO;
    private CotizacionResponseDTO responseDTO;
    private UUID cotizacionId;
    private UUID usuarioId;
    private UUID productoId;

    @BeforeEach
    void setUp() {
        cotizacionId = UUID.randomUUID();
        usuarioId = UUID.randomUUID();
        productoId = UUID.randomUUID();

        usuario = Usuario.builder()
                .id(usuarioId)
                .nombre("Maria López")
                .email("maria@example.com")
                .build();

        producto = Producto.builder()
                .id(productoId)
                .nombre("Girasoles")
                .precio(new BigDecimal("15.00"))
                .stock(20)
                .disponible(true)
                .build();

        ItemCotizacionRequestDTO itemDto = new ItemCotizacionRequestDTO(productoId, 2);

        requestDTO = new CotizacionRequestDTO();
        requestDTO.setUsuarioId(usuarioId);
        requestDTO.setMensajeCliente("Cotización para evento");
        requestDTO.setPresupuesto(new BigDecimal("100.00"));
        requestDTO.setItems(List.of(itemDto));

        cotizacion = Cotizacion.builder()
                .id(cotizacionId)
                .fechaCreacion(LocalDateTime.now())
                .usuario(usuario)
                .mensajeCliente("Cotización para evento")
                .presupuesto(new BigDecimal("100.00"))
                .estado(EstadoCotizacion.PENDIENTE)
                .total(new BigDecimal("30.00"))
                .items(new ArrayList<>())
                .build();

        responseDTO = new CotizacionResponseDTO(
                cotizacionId,
                LocalDateTime.now(),
                new BigDecimal("30.00"),
                "Cotización para evento",
                new BigDecimal("100.00"),
                EstadoCotizacion.PENDIENTE,
                List.of()
        );
    }

    @Test
    @DisplayName("Debe crear una cotización exitosamente y calcular el total correctamente")
    void crearCotizacion_Exitoso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));
        when(cotizacionRepository.save(any(Cotizacion.class))).thenReturn(cotizacion);
        when(cotizacionMapper.toResponseDTO(any(Cotizacion.class))).thenReturn(responseDTO);

        CotizacionResponseDTO resultado = cotizacionService.crearCotizacion(requestDTO);

        assertNotNull(resultado);
        assertEquals(cotizacionId, resultado.getId());
        assertEquals(new BigDecimal("30.00"), resultado.getTotal());

        verify(usuarioRepository, times(1)).findById(usuarioId);
        verify(productoRepository, times(1)).findById(productoId);
        verify(cotizacionRepository, times(1)).save(any(Cotizacion.class));
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el usuario no existe")
    void crearCotizacion_UsuarioNoEncontrado_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> cotizacionService.crearCotizacion(requestDTO)
        );

        verify(cotizacionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException cuando el stock es insuficiente")
    void crearCotizacion_StockInsuficiente_LanzaExcepcion() {
        producto.setStock(1); // Solicitó 2 en el requestDTO
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));

        BusinessRuleException exception = assertThrows(
                BusinessRuleException.class,
                () -> cotizacionService.crearCotizacion(requestDTO)
        );

        assertTrue(exception.getMessage().contains("Stock insuficiente"));
        verify(cotizacionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException cuando el total supera el presupuesto del cliente")
    void crearCotizacion_SuperaPresupuesto_LanzaExcepcion() {
        requestDTO.setPresupuesto(new BigDecimal("20.00")); // Total es 30.00 (15 * 2)
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));

        BusinessRuleException exception = assertThrows(
                BusinessRuleException.class,
                () -> cotizacionService.crearCotizacion(requestDTO)
        );

        assertTrue(exception.getMessage().contains("supera el presupuesto"));
        verify(cotizacionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe buscar una cotización por ID exitosamente")
    void buscarPorId_Exitoso() {
        when(cotizacionRepository.findById(cotizacionId)).thenReturn(Optional.of(cotizacion));
        when(cotizacionMapper.toResponseDTO(cotizacion)).thenReturn(responseDTO);

        CotizacionResponseDTO resultado = cotizacionService.buscarPorId(cotizacionId);

        assertNotNull(resultado);
        assertEquals(cotizacionId, resultado.getId());

        verify(cotizacionRepository, times(1)).findById(cotizacionId);
    }

    @Test
    @DisplayName("Debe listar todas las cotizaciones")
    void listarTodas_Exitoso() {
        when(cotizacionRepository.findAll()).thenReturn(List.of(cotizacion));
        when(cotizacionMapper.toResponseDTO(cotizacion)).thenReturn(responseDTO);

        List<CotizacionResponseDTO> resultado = cotizacionService.listarTodas();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());

        verify(cotizacionRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe listar cotizaciones por usuario exitosamente")
    void listarPorUsuario_Exitoso() {
        when(usuarioRepository.existsById(usuarioId)).thenReturn(true);
        when(cotizacionRepository.findByUsuarioId(usuarioId)).thenReturn(List.of(cotizacion));
        when(cotizacionMapper.toResponseDTO(cotizacion)).thenReturn(responseDTO);

        List<CotizacionResponseDTO> resultado = cotizacionService.listarPorUsuario(usuarioId);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());

        verify(usuarioRepository, times(1)).existsById(usuarioId);
        verify(cotizacionRepository, times(1)).findByUsuarioId(usuarioId);
    }
}
