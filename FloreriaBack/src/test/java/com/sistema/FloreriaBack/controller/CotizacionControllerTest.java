package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.GlobalExceptionHandler;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.model.enums.EstadoCotizacion;
import com.sistema.FloreriaBack.service.CotizacionService;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CotizacionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CotizacionService cotizacionService;

    @InjectMocks
    private CotizacionController cotizacionController;

    private CotizacionResponseDTO responseDTO;
    private UUID cotizacionId;
    private UUID usuarioId;
    private UUID productoId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(cotizacionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        cotizacionId = UUID.randomUUID();
        usuarioId = UUID.randomUUID();
        productoId = UUID.randomUUID();

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

    private String crearRequestJson() {
        return """
                {
                    "usuarioId": "%s",
                    "mensajeCliente": "Cotización para evento",
                    "presupuesto": 100.00,
                    "items": [
                        {
                            "productoId": "%s",
                            "cantidad": 2
                        }
                    ]
                }
                """.formatted(usuarioId, productoId);
    }

    @Test
    @DisplayName("POST /api/cotizaciones - Debe crear cotización exitosamente y retornar 201 Created")
    void crear_Exitoso() throws Exception {
        when(cotizacionService.crearCotizacion(any())).thenReturn(responseDTO);

        mockMvc.perform(post("/api/cotizaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(cotizacionId.toString()))
                .andExpect(jsonPath("$.total").value(30.00))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));

        verify(cotizacionService, times(1)).crearCotizacion(any());
    }

    @Test
    @DisplayName("POST /api/cotizaciones - Debe retornar 400 Bad Request cuando no se envían items")
    void crear_SinItems_Retorna400() throws Exception {
        String jsonSinItems = """
                {
                    "usuarioId": "%s",
                    "mensajeCliente": "Sin items",
                    "items": []
                }
                """.formatted(usuarioId);

        mockMvc.perform(post("/api/cotizaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonSinItems))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.items").exists());

        verify(cotizacionService, never()).crearCotizacion(any());
    }

    @Test
    @DisplayName("POST /api/cotizaciones - Debe retornar 400 Bad Request cuando el stock es insuficiente")
    void crear_StockInsuficiente_Retorna400() throws Exception {
        when(cotizacionService.crearCotizacion(any()))
                .thenThrow(new BusinessRuleException("Stock insuficiente para \"Girasoles\". Disponible: 1"));

        mockMvc.perform(post("/api/cotizaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.mensaje", containsString("Stock insuficiente")));

        verify(cotizacionService, times(1)).crearCotizacion(any());
    }

    @Test
    @DisplayName("GET /api/cotizaciones - Debe listar todas las cotizaciones y retornar 200 OK")
    void listarTodas_Exitoso() throws Exception {
        when(cotizacionService.listarTodas()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/cotizaciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(cotizacionId.toString()));

        verify(cotizacionService, times(1)).listarTodas();
    }

    @Test
    @DisplayName("GET /api/cotizaciones/{id} - Debe buscar una cotización por ID y retornar 200 OK")
    void buscarPorId_Exitoso() throws Exception {
        when(cotizacionService.buscarPorId(cotizacionId)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/cotizaciones/{id}", cotizacionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(cotizacionId.toString()));

        verify(cotizacionService, times(1)).buscarPorId(cotizacionId);
    }

    @Test
    @DisplayName("GET /api/cotizaciones/{id} - Debe retornar 404 Not Found cuando la cotización no existe")
    void buscarPorId_NoEncontrado_Retorna404() throws Exception {
        when(cotizacionService.buscarPorId(cotizacionId))
                .thenThrow(new ResourceNotFoundException("Cotización no encontrada con ID: " + cotizacionId));

        mockMvc.perform(get("/api/cotizaciones/{id}", cotizacionId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(cotizacionService, times(1)).buscarPorId(cotizacionId);
    }

    @Test
    @DisplayName("GET /api/cotizaciones/usuario/{usuarioId} - Debe listar cotizaciones por usuario y retornar 200 OK")
    void listarPorUsuario_Exitoso() throws Exception {
        when(cotizacionService.listarPorUsuario(usuarioId)).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/cotizaciones/usuario/{usuarioId}", usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(cotizacionService, times(1)).listarPorUsuario(usuarioId);
    }
}
