package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.CategoriaRequestDTO;
import com.sistema.FloreriaBack.dto.response.CategoriaResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.CategoriaMapper;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.service.impl.CategoriaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProductoRepository productoRepository;

    private CategoriaMapper categoriaMapper;

    private CategoriaServiceImpl categoriaService;

    private Categoria categoria;
    private CategoriaRequestDTO requestDTO;
    private UUID categoriaId;

    @BeforeEach
    void setUp() {
        categoriaMapper = new CategoriaMapper();
        categoriaService = new CategoriaServiceImpl(categoriaRepository, productoRepository, categoriaMapper);

        categoriaId = UUID.randomUUID();

        categoria = Categoria.builder()
                .id(categoriaId)
                .nombre("Orquideas")
                .descripcion("Variedad de orquideas exoticas")
                .build();

        requestDTO = new CategoriaRequestDTO();
        requestDTO.setNombre("Orquideas");
        requestDTO.setDescripcion("Variedad de orquideas exoticas");
    }

    @Test
    @DisplayName("Debe registrar una categoria exitosamente")
    void registrar_Exitoso() {
        when(categoriaRepository.existsByNombre("Orquideas")).thenReturn(false);
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria);

        CategoriaResponseDTO resultado = categoriaService.registrar(requestDTO);

        assertNotNull(resultado);
        assertEquals(categoriaId, resultado.getId());
        assertEquals("Orquideas", resultado.getNombre());

        verify(categoriaRepository, times(1)).existsByNombre("Orquideas");
        verify(categoriaRepository, times(1)).save(any(Categoria.class));
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException al registrar con nombre ya existente")
    void registrar_NombreExistente_LanzaExcepcion() {
        when(categoriaRepository.existsByNombre("Orquideas")).thenReturn(true);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> categoriaService.registrar(requestDTO));

        assertTrue(ex.getMessage().contains("Ya existe una categoria con ese nombre")
                || ex.getMessage().toLowerCase().contains("ya existe"));
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe listar todas las categorías")
    void listar_Exitoso() {
        when(categoriaRepository.findAll()).thenReturn(List.of(categoria));

        List<CategoriaResponseDTO> resultado = categoriaService.listar();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Orquideas", resultado.get(0).getNombre());

        verify(categoriaRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe buscar una categoría por ID exitosamente")
    void buscarPorId_Exitoso() {
        when(categoriaRepository.findById(categoriaId)).thenReturn(Optional.of(categoria));

        CategoriaResponseDTO resultado = categoriaService.buscarPorId(categoriaId);

        assertNotNull(resultado);
        assertEquals(categoriaId, resultado.getId());

        verify(categoriaRepository, times(1)).findById(categoriaId);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al buscar por ID inexistente")
    void buscarPorId_NoEncontrado_LanzaExcepcion() {
        when(categoriaRepository.findById(categoriaId)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> categoriaService.buscarPorId(categoriaId));

        verify(categoriaRepository, times(1)).findById(categoriaId);
    }

    @Test
    @DisplayName("Debe eliminar una categoría exitosamente cuando no tiene productos asociados")
    void eliminar_Exitoso() {
        when(categoriaRepository.existsById(categoriaId)).thenReturn(true);
        when(productoRepository.existsByCategoriaId(categoriaId)).thenReturn(false);

        categoriaService.eliminar(categoriaId);

        verify(categoriaRepository, times(1)).existsById(categoriaId);
        verify(productoRepository, times(1)).existsByCategoriaId(categoriaId);
        verify(categoriaRepository, times(1)).deleteById(categoriaId);
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException al eliminar categoría que tiene productos asociados")
    void eliminar_ConProductosAsociados_LanzaExcepcion() {
        when(categoriaRepository.existsById(categoriaId)).thenReturn(true);
        when(productoRepository.existsByCategoriaId(categoriaId)).thenReturn(true);

        BusinessRuleException exception = assertThrows(
                BusinessRuleException.class,
                () -> categoriaService.eliminar(categoriaId));

        assertTrue(exception.getMessage().contains("tiene productos asociados"));
        verify(categoriaRepository, times(1)).existsById(categoriaId);
        verify(productoRepository, times(1)).existsByCategoriaId(categoriaId);
        verify(categoriaRepository, never()).deleteById(any());
    }
}
