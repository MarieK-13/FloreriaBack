package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.response.DetalleProductoResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.GlobalExceptionHandler;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.service.DetalleProductoService;
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

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DetalleProductoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DetalleProductoService detalleProductoService;

    @InjectMocks
    private DetalleProductoController detalleProductoController;

    private DetalleProductoResponseDTO responseDTO;
    private UUID detalleId;
    private UUID productoId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(detalleProductoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        detalleId = UUID.randomUUID();
        productoId = UUID.randomUUID();

        responseDTO = new DetalleProductoResponseDTO(
                detalleId,
                productoId,
                "Orquídea Blanca",
                "Regar 2 veces por semana",
                15,
                "Macetas de cerámica",
                "Aniversarios",
                "Entregar en mano"
        );
    }

    private String crearRequestJson(UUID pId) {
        return """
                {
                    "productoId": "%s",
                    "cuidados": "Regar 2 veces por semana",
                    "duracionDias": 15,
                    "materiales": "Macetas de cerámica",
                    "ocasion": "Aniversarios",
                    "instruccionesEntrega": "Entregar en mano"
                }
                """.formatted(pId);
    }

    @Test
    @DisplayName("POST /api/detalle-productos - Debe registrar el detalle de producto exitosamente y retornar 201 Created")
    void registrar_Exitoso() throws Exception {
        when(detalleProductoService.registrar(any())).thenReturn(responseDTO);

        mockMvc.perform(post("/api/detalle-productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson(productoId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(detalleId.toString()))
                .andExpect(jsonPath("$.productoId").value(productoId.toString()))
                .andExpect(jsonPath("$.productoNombre").value("Orquídea Blanca"))
                .andExpect(jsonPath("$.duracionDias").value(15));

        verify(detalleProductoService, times(1)).registrar(any());
    }

    @Test
    @DisplayName("POST /api/detalle-productos - Debe retornar 400 Bad Request cuando la validación del DTO falla")
    void registrar_ValidacionFallida_Retorna400() throws Exception {
        String jsonInvalido = "{}";

        mockMvc.perform(post("/api/detalle-productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.productoId").exists());

        verify(detalleProductoService, never()).registrar(any());
    }

    @Test
    @DisplayName("POST /api/detalle-productos - Debe retornar 400 Bad Request cuando el producto ya tiene detalle")
    void registrar_DetalleExistente_Retorna400() throws Exception {
        when(detalleProductoService.registrar(any()))
                .thenThrow(new BusinessRuleException("El producto ya tiene un detalle registrado: " + productoId));

        mockMvc.perform(post("/api/detalle-productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson(productoId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.mensaje", containsString("ya tiene un detalle registrado")));

        verify(detalleProductoService, times(1)).registrar(any());
    }

    @Test
    @DisplayName("POST /api/detalle-productos - Debe retornar 404 Not Found cuando el producto no existe")
    void registrar_ProductoNoEncontrado_Retorna404() throws Exception {
        when(detalleProductoService.registrar(any()))
                .thenThrow(new ResourceNotFoundException("Producto no encontrado: " + productoId));

        mockMvc.perform(post("/api/detalle-productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson(productoId)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.mensaje", containsString("Producto no encontrado")));

        verify(detalleProductoService, times(1)).registrar(any());
    }

    @Test
    @DisplayName("GET /api/detalle-productos - Debe listar todos los detalles y retornar 200 OK")
    void listar_Exitoso() throws Exception {
        when(detalleProductoService.listar()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/detalle-productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].productoNombre").value("Orquídea Blanca"));

        verify(detalleProductoService, times(1)).listar();
    }

    @Test
    @DisplayName("GET /api/detalle-productos/{id} - Debe buscar detalle por ID y retornar 200 OK")
    void buscarPorId_Exitoso() throws Exception {
        when(detalleProductoService.buscarPorId(detalleId)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/detalle-productos/{id}", detalleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(detalleId.toString()));

        verify(detalleProductoService, times(1)).buscarPorId(detalleId);
    }

    @Test
    @DisplayName("GET /api/detalle-productos/{id} - Debe retornar 404 Not Found cuando el detalle no existe")
    void buscarPorId_NoEncontrado_Retorna404() throws Exception {
        when(detalleProductoService.buscarPorId(detalleId))
                .thenThrow(new ResourceNotFoundException("Detalle de producto no encontrado: " + detalleId));

        mockMvc.perform(get("/api/detalle-productos/{id}", detalleId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(detalleProductoService, times(1)).buscarPorId(detalleId);
    }

    @Test
    @DisplayName("GET /api/detalle-productos/producto/{productoId} - Debe buscar detalle por ID de producto y retornar 200 OK")
    void buscarPorProducto_Exitoso() throws Exception {
        when(detalleProductoService.buscarPorProducto(productoId)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/detalle-productos/producto/{productoId}", productoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productoId").value(productoId.toString()));

        verify(detalleProductoService, times(1)).buscarPorProducto(productoId);
    }

    @Test
    @DisplayName("GET /api/detalle-productos/producto/{productoId} - Debe retornar 404 Not Found cuando el producto no tiene detalle")
    void buscarPorProducto_NoEncontrado_Retorna404() throws Exception {
        when(detalleProductoService.buscarPorProducto(productoId))
                .thenThrow(new ResourceNotFoundException("El producto no tiene detalle registrado: " + productoId));

        mockMvc.perform(get("/api/detalle-productos/producto/{productoId}", productoId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(detalleProductoService, times(1)).buscarPorProducto(productoId);
    }
}
