package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.CotizacionRequestDTO;
import com.sistema.FloreriaBack.dto.request.ItemCotizacionRequestDTO;
import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.CotizacionMapper;
import com.sistema.FloreriaBack.model.*;
import com.sistema.FloreriaBack.repository.*;
import com.sistema.FloreriaBack.service.impl.CotizacionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
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

    private CotizacionMapper cotizacionMapper;

    private CotizacionServiceImpl cotizacionService;

    private Usuario usuario;
    private Producto producto;
    private CotizacionRequestDTO requestDTO;
    private UUID usuarioId;
    private UUID productoId;

    @BeforeEach
    void setUp() {
        cotizacionMapper = new CotizacionMapper();
        cotizacionService = new CotizacionServiceImpl(
                cotizacionRepository, usuarioRepository, productoRepository, cotizacionMapper);

        usuarioId = UUID.randomUUID();
        productoId = UUID.randomUUID();

        usuario = Usuario.builder()
                .id(usuarioId)
                .nombre("Maria Lopez")
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
        requestDTO.setMensajeCliente("Cotizacion para evento");
        requestDTO.setPresupuesto(new BigDecimal("100.00"));
        requestDTO.setItems(List.of(itemDto));
    }

    @Test
    @DisplayName("Debe crear una cotización exitosamente y calcular el total correctamente")
    void crearCotizacion_Exitoso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));
        when(cotizacionRepository.save(any(Cotizacion.class))).thenAnswer(inv -> inv.getArgument(0));

        CotizacionResponseDTO resultado = cotizacionService.crearCotizacion(requestDTO);

        ArgumentCaptor<Cotizacion> captor = ArgumentCaptor.forClass(Cotizacion.class);
        verify(cotizacionRepository).save(captor.capture());
        Cotizacion guardada = captor.getValue();

        assertEquals(0, new BigDecimal("30.00").compareTo(guardada.getTotal()));
        assertEquals(1, guardada.getItems().size());

        ItemCotizacion item = guardada.getItems().get(0);
        assertEquals("Girasoles", item.getProductoNombre());
        assertEquals(0, new BigDecimal("15.00").compareTo(item.getPrecioUnitario()));
        assertEquals(0, new BigDecimal("30.00").compareTo(item.getSubtotal()));

        assertEquals(0, new BigDecimal("30.00").compareTo(resultado.getTotal()));
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
    @DisplayName("Debe lanzar ResourceNotFoundException si algun producto del item no existe")
    void crearCotizacion_ProductoNoEncontrado_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(productoId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> cotizacionService.crearCotizacion(requestDTO));

        verify(cotizacionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException cuando el stock es insuficiente")
    void crearCotizacion_StockInsuficiente_LanzaExcepcion() {
        producto.setStock(1); 
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
        requestDTO.setPresupuesto(new BigDecimal("20.00")); 
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
         Cotizacion cotizacion = Cotizacion.builder().id(UUID.randomUUID()).total(BigDecimal.ZERO).build();
        when(cotizacionRepository.findById(cotizacion.getId())).thenReturn(Optional.of(cotizacion));

        CotizacionResponseDTO resultado = cotizacionService.buscarPorId(cotizacion.getId());

        assertEquals(cotizacion.getId(), resultado.getId());
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al buscar una cotizacion inexistente")
    void buscarPorId_NoEncontrado_LanzaExcepcion() {
        UUID idInexistente = UUID.randomUUID();
        when(cotizacionRepository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> cotizacionService.buscarPorId(idInexistente));
    }

    @Test
    @DisplayName("Debe listar todas las cotizaciones")
    void listarTodas_Exitoso() {
        Cotizacion cotizacion = Cotizacion.builder().id(UUID.randomUUID()).total(BigDecimal.TEN).build();
        when(cotizacionRepository.findAll()).thenReturn(List.of(cotizacion));

        List<CotizacionResponseDTO> resultado = cotizacionService.listarTodas();

        assertEquals(1, resultado.size());
    }

    @Test
    @DisplayName("Debe listar cotizaciones por usuario exitosamente")
    void listarPorUsuario_Exitoso() {
        Cotizacion cotizacion = Cotizacion.builder().id(UUID.randomUUID()).total(BigDecimal.TEN).build();
        when(usuarioRepository.existsById(usuarioId)).thenReturn(true);
        when(cotizacionRepository.findByUsuarioId(usuarioId)).thenReturn(List.of(cotizacion));

        List<CotizacionResponseDTO> resultado = cotizacionService.listarPorUsuario(usuarioId);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());

        verify(usuarioRepository, times(1)).existsById(usuarioId);
        verify(cotizacionRepository, times(1)).findByUsuarioId(usuarioId);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al listar cotizaciones de un usuario inexistente")
    void listarPorUsuario_UsuarioNoExiste_LanzaExcepcion() {
        when(usuarioRepository.existsById(usuarioId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> cotizacionService.listarPorUsuario(usuarioId));

        verify(usuarioRepository, times(1)).existsById(usuarioId);
        verify(cotizacionRepository, never()).findByUsuarioId(any());
    }
}
