package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.ProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.ProductoMapper;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.service.impl.ProductoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
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
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProductoMapper productoMapper;

    @InjectMocks
    private ProductoServiceImpl productoService;

    private Categoria categoria;
    private Producto producto;
    private ProductoRequestDTO requestDTO;
    private ProductoResponseDTO responseDTO;
    private UUID productoId;
    private UUID categoriaId;

    @BeforeEach
    void setUp() {
        productoId = UUID.randomUUID();
        categoriaId = UUID.randomUUID();

        categoria = Categoria.builder()
                .id(categoriaId)
                .nombre("Flores")
                .descripcion("Categoría de flores")
                .build();

        producto = Producto.builder()
                .id(productoId)
                .nombre("Rosas Rojas")
                .descripcion("Ramo de 12 rosas rojas")
                .precio(new BigDecimal("25.00"))
                .stock(10)
                .disponible(true)
                .color("Rojo")
                .tamano("Grande")
                .categoria(categoria)
                .build();

        requestDTO = new ProductoRequestDTO();
        requestDTO.setNombre("Rosas Rojas");
        requestDTO.setDescripcion("Ramo de 12 rosas rojas");
        requestDTO.setPrecio(new BigDecimal("25.00"));
        requestDTO.setStock(10);
        requestDTO.setColor("Rojo");
        requestDTO.setTamano("Grande");
        requestDTO.setCategoriaId(categoriaId);

        responseDTO = new ProductoResponseDTO(
                productoId,
                "Rosas Rojas",
                "Ramo de 12 rosas rojas",
                new BigDecimal("25.00"),
                10,
                true,
                "Rojo",
                "Grande",
                "Flores"
        );
    }

    @Test
    @DisplayName("Debe registrar un producto exitosamente")
    void registrar_Exitoso() {
        when(categoriaRepository.findById(categoriaId)).thenReturn(Optional.of(categoria));
        when(productoMapper.toEntity(requestDTO, categoria)).thenReturn(producto);
        when(productoRepository.save(producto)).thenReturn(producto);
        when(productoMapper.toResponseDTO(producto)).thenReturn(responseDTO);

        ProductoResponseDTO resultado = productoService.registrar(requestDTO);

        assertNotNull(resultado);
        assertEquals(productoId, resultado.getId());
        assertEquals("Rosas Rojas", resultado.getNombre());
        assertEquals("Flores", resultado.getCategoriaNombre());

        verify(categoriaRepository, times(1)).findById(categoriaId);
        verify(productoMapper, times(1)).toEntity(requestDTO, categoria);
        verify(productoRepository, times(1)).save(producto);
        verify(productoMapper, times(1)).toResponseDTO(producto);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al registrar con categoría inexistente")
    void registrar_CategoriaNoEncontrada_LanzaExcepcion() {
        when(categoriaRepository.findById(categoriaId)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> productoService.registrar(requestDTO)
        );

        assertTrue(exception.getMessage().contains("Categoría no encontrada"));
        verify(categoriaRepository, times(1)).findById(categoriaId);
        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe listar todos los productos")
    void listar_Exitoso() {
        when(productoRepository.findAll()).thenReturn(List.of(producto));
        when(productoMapper.toResponseDTO(producto)).thenReturn(responseDTO);

        List<ProductoResponseDTO> resultado = productoService.listar();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Rosas Rojas", resultado.get(0).getNombre());

        verify(productoRepository, times(1)).findAll();
        verify(productoMapper, times(1)).toResponseDTO(producto);
    }

    @Test
    @DisplayName("Debe buscar un producto por ID exitosamente")
    void buscarPorId_Exitoso() {
        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));
        when(productoMapper.toResponseDTO(producto)).thenReturn(responseDTO);

        ProductoResponseDTO resultado = productoService.buscarPorId(productoId);

        assertNotNull(resultado);
        assertEquals(productoId, resultado.getId());
        assertEquals("Rosas Rojas", resultado.getNombre());

        verify(productoRepository, times(1)).findById(productoId);
        verify(productoMapper, times(1)).toResponseDTO(producto);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al buscar por ID inexistente")
    void buscarPorId_NoEncontrado_LanzaExcepcion() {
        when(productoRepository.findById(productoId)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> productoService.buscarPorId(productoId)
        );

        assertTrue(exception.getMessage().contains("Producto no encontrado"));
        verify(productoRepository, times(1)).findById(productoId);
    }

    @Test
    @DisplayName("Debe listar productos por categoría exitosamente")
    void listarPorCategoria_Exitoso() {
        when(productoRepository.findByCategoriaId(categoriaId)).thenReturn(List.of(producto));
        when(productoMapper.toResponseDTO(producto)).thenReturn(responseDTO);

        List<ProductoResponseDTO> resultado = productoService.listarPorCategoria(categoriaId);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Flores", resultado.get(0).getCategoriaNombre());

        verify(productoRepository, times(1)).findByCategoriaId(categoriaId);
        verify(productoMapper, times(1)).toResponseDTO(producto);
    }
}
