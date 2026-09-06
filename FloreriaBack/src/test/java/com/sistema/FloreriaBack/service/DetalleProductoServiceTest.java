package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.DetalleProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.DetalleProductoResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.DetalleProductoMapper;
import com.sistema.FloreriaBack.model.DetalleProducto;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.repository.DetalleProductoRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.service.impl.DetalleProductoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class DetalleProductoServiceTest {

    @Mock
    private DetalleProductoRepository detalleProductoRepository;

    @Mock
    private ProductoRepository productoRepository;

    private DetalleProductoMapper detalleProductoMapper;
    private DetalleProductoServiceImpl detalleProductoService;

    private Producto producto;
    private DetalleProducto detalleProducto;
    private DetalleProductoRequestDTO requestDTO;
    private UUID detalleId;
    private UUID productoId;

    @BeforeEach
    void setUp() {
        detalleProductoMapper = new DetalleProductoMapper();
        detalleProductoService = new DetalleProductoServiceImpl(
                detalleProductoRepository,
                productoRepository,
                detalleProductoMapper
        );

        detalleId = UUID.randomUUID();
        productoId = UUID.randomUUID();

        producto = Producto.builder()
                .id(productoId)
                .nombre("Orquídea Blanca")
                .precio(new BigDecimal("45.00"))
                .stock(15)
                .disponible(true)
                .build();

        detalleProducto = DetalleProducto.builder()
                .id(detalleId)
                .producto(producto)
                .cuidados("Regar 2 veces por semana")
                .duracionDias(15)
                .materiales("Macetas de cerámica")
                .ocasion("Aniversarios")
                .instruccionesEntrega("Entregar en mano")
                .build();

        requestDTO = new DetalleProductoRequestDTO();
        requestDTO.setProductoId(productoId);
        requestDTO.setCuidados("Regar 2 veces por semana");
        requestDTO.setDuracionDias(15);
        requestDTO.setMateriales("Macetas de cerámica");
        requestDTO.setOcasion("Aniversarios");
        requestDTO.setInstruccionesEntrega("Entregar en mano");
    }

    @Test
    @DisplayName("Debe registrar el detalle de un producto exitosamente")
    void registrar_Exitoso() {
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));
        when(detalleProductoRepository.existsByProductoId(productoId)).thenReturn(false);
        when(detalleProductoRepository.save(any(DetalleProducto.class))).thenReturn(detalleProducto);

        DetalleProductoResponseDTO resultado = detalleProductoService.registrar(requestDTO);

        assertNotNull(resultado);
        assertEquals(detalleId, resultado.getId());
        assertEquals(productoId, resultado.getProductoId());
        assertEquals("Orquídea Blanca", resultado.getProductoNombre());
        assertEquals("Regar 2 veces por semana", resultado.getCuidados());

        verify(productoRepository, times(1)).findById(productoId);
        verify(detalleProductoRepository, times(1)).existsByProductoId(productoId);
        verify(detalleProductoRepository, times(1)).save(any(DetalleProducto.class));
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al registrar cuando el producto no existe")
    void registrar_ProductoNoEncontrado_LanzaExcepcion() {
        when(productoRepository.findById(productoId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> detalleProductoService.registrar(requestDTO));

        verify(detalleProductoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException cuando el producto ya tiene un detalle registrado")
    void registrar_DetalleExistente_LanzaExcepcion() {
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));
        when(detalleProductoRepository.existsByProductoId(productoId)).thenReturn(true);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> detalleProductoService.registrar(requestDTO));

        assertTrue(ex.getMessage().contains("El producto ya tiene un detalle registrado"));
        verify(detalleProductoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe listar todos los detalles de productos")
    void listar_Exitoso() {
        when(detalleProductoRepository.findAll()).thenReturn(List.of(detalleProducto));

        List<DetalleProductoResponseDTO> resultado = detalleProductoService.listar();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Orquídea Blanca", resultado.get(0).getProductoNombre());

        verify(detalleProductoRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe buscar detalle de producto por ID exitosamente")
    void buscarPorId_Exitoso() {
        when(detalleProductoRepository.findById(detalleId)).thenReturn(Optional.of(detalleProducto));

        DetalleProductoResponseDTO resultado = detalleProductoService.buscarPorId(detalleId);

        assertNotNull(resultado);
        assertEquals(detalleId, resultado.getId());

        verify(detalleProductoRepository, times(1)).findById(detalleId);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al buscar por ID de detalle inexistente")
    void buscarPorId_NoEncontrado_LanzaExcepcion() {
        when(detalleProductoRepository.findById(detalleId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> detalleProductoService.buscarPorId(detalleId));

        verify(detalleProductoRepository, times(1)).findById(detalleId);
    }

    @Test
    @DisplayName("Debe buscar detalle por ID de producto exitosamente")
    void buscarPorProducto_Exitoso() {
        when(detalleProductoRepository.findByProductoId(productoId)).thenReturn(Optional.of(detalleProducto));

        DetalleProductoResponseDTO resultado = detalleProductoService.buscarPorProducto(productoId);

        assertNotNull(resultado);
        assertEquals(productoId, resultado.getProductoId());
        assertEquals("Orquídea Blanca", resultado.getProductoNombre());

        verify(detalleProductoRepository, times(1)).findByProductoId(productoId);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al buscar detalle por ID de producto que no tiene detalle")
    void buscarPorProducto_NoEncontrado_LanzaExcepcion() {
        when(detalleProductoRepository.findByProductoId(productoId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> detalleProductoService.buscarPorProducto(productoId));

        verify(detalleProductoRepository, times(1)).findByProductoId(productoId);
    }
}
