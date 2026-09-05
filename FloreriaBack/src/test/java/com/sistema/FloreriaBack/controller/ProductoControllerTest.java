package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.ProductoRequestDTO;
import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.exception.GlobalExceptionHandler;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.service.ProductoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProductoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProductoService productoService;

    @InjectMocks
    private ProductoController productoController;

    private ProductoResponseDTO responseDTO;
    private UUID productoId;
    private UUID categoriaId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        productoId = UUID.randomUUID();
        categoriaId = UUID.randomUUID();

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

    private String crearRequestJson(UUID catId) {
        return """
                {
                    "nombre": "Rosas Rojas",
                    "descripcion": "Ramo de 12 rosas rojas",
                    "precio": 25.00,
                    "stock": 10,
                    "color": "Rojo",
                    "tamano": "Grande",
                    "categoriaId": "%s"
                }
                """.formatted(catId);
    }

    @Test
    @DisplayName("POST /api/productos - Debe registrar un producto exitosamente y retornar 201 Created")
    void registrar_Exitoso() throws Exception {
        when(productoService.registrar(any(ProductoRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson(categoriaId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(productoId.toString()))
                .andExpect(jsonPath("$.nombre").value("Rosas Rojas"))
                .andExpect(jsonPath("$.precio").value(25.00))
                .andExpect(jsonPath("$.stock").value(10))
                .andExpect(jsonPath("$.disponible").value(true))
                .andExpect(jsonPath("$.categoriaNombre").value("Flores"));

        verify(productoService, times(1)).registrar(any(ProductoRequestDTO.class));
    }

    @Test
    @DisplayName("POST /api/productos - Debe retornar 400 Bad Request cuando la validación del DTO falla")
    void registrar_ValidacionFallida_Retorna400() throws Exception {
        String jsonInvalido = "{}";

        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.nombre").exists())
                .andExpect(jsonPath("$.errores.precio").exists())
                .andExpect(jsonPath("$.errores.stock").exists())
                .andExpect(jsonPath("$.errores.categoriaId").exists());

        verify(productoService, never()).registrar(any());
    }

    @Test
    @DisplayName("POST /api/productos - Debe retornar 404 Not Found cuando la categoría no existe")
    void registrar_CategoriaNoEncontrada_Retorna404() throws Exception {
        when(productoService.registrar(any(ProductoRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("Categoría no encontrada: " + categoriaId));

        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson(categoriaId)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.mensaje", containsString("Categoría no encontrada")));

        verify(productoService, times(1)).registrar(any(ProductoRequestDTO.class));
    }

    @Test
    @DisplayName("GET /api/productos - Debe listar todos los productos y retornar 200 OK")
    void listar_Exitoso() throws Exception {
        when(productoService.listar()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(productoId.toString()))
                .andExpect(jsonPath("$[0].nombre").value("Rosas Rojas"));

        verify(productoService, times(1)).listar();
    }

    @Test
    @DisplayName("GET /api/productos - Debe retornar lista vacía cuando no existen productos")
    void listar_ListaVacia() throws Exception {
        when(productoService.listar()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        verify(productoService, times(1)).listar();
    }

    @Test
    @DisplayName("GET /api/productos/{id} - Debe buscar un producto por ID y retornar 200 OK")
    void buscarPorId_Exitoso() throws Exception {
        when(productoService.buscarPorId(productoId)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/productos/{id}", productoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productoId.toString()))
                .andExpect(jsonPath("$.nombre").value("Rosas Rojas"));

        verify(productoService, times(1)).buscarPorId(productoId);
    }

    @Test
    @DisplayName("GET /api/productos/{id} - Debe retornar 404 Not Found cuando el producto no existe")
    void buscarPorId_NoEncontrado_Retorna404() throws Exception {
        when(productoService.buscarPorId(productoId))
                .thenThrow(new ResourceNotFoundException("Producto no encontrado: " + productoId));

        mockMvc.perform(get("/api/productos/{id}", productoId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.mensaje", containsString("Producto no encontrado")));

        verify(productoService, times(1)).buscarPorId(productoId);
    }

    @Test
    @DisplayName("GET /api/productos/categoria/{categoriaId} - Debe listar productos por categoría y retornar 200 OK")
    void listarPorCategoria_Exitoso() throws Exception {
        when(productoService.listarPorCategoria(categoriaId)).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/productos/categoria/{categoriaId}", categoriaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].categoriaNombre").value("Flores"));

        verify(productoService, times(1)).listarPorCategoria(categoriaId);
    }
}
