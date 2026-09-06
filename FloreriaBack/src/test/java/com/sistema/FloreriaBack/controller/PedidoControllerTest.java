package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.response.DetallePedidoResponseDTO;
import com.sistema.FloreriaBack.dto.response.PedidoResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.GlobalExceptionHandler;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import com.sistema.FloreriaBack.service.PedidoService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PedidoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PedidoService pedidoService;

    @InjectMocks
    private PedidoController pedidoController;

    private PedidoResponseDTO responseDTO;
    private UUID pedidoId;
    private UUID usuarioId;
    private UUID productoId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(pedidoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        pedidoId = UUID.randomUUID();
        usuarioId = UUID.randomUUID();
        productoId = UUID.randomUUID();

        DetallePedidoResponseDTO detalleDTO = new DetallePedidoResponseDTO(
                UUID.randomUUID(),
                productoId,
                "Tulipanes Amarillos",
                2,
                new BigDecimal("30.00"),
                new BigDecimal("60.00")
        );

        responseDTO = new PedidoResponseDTO(
                pedidoId,
                LocalDateTime.now(),
                new BigDecimal("60.00"),
                "Av. Principal 123",
                "Dejar en recepción",
                EstadoPedido.PENDIENTE,
                usuarioId,
                "Carlos Mendoza",
                List.of(detalleDTO)
        );
    }

    private String crearRequestJson(UUID uId, UUID pId) {
        return """
                {
                    "usuarioId": "%s",
                    "direccionEntrega": "Av. Principal 123",
                    "instruccionesEntrega": "Dejar en recepción",
                    "detalles": [
                        {
                            "productoId": "%s",
                            "cantidad": 2
                        }
                    ]
                }
                """.formatted(uId, pId);
    }

    @Test
    @DisplayName("POST /api/pedidos - Debe crear un pedido exitosamente y retornar 201 Created")
    void crear_Exitoso() throws Exception {
        when(pedidoService.crear(any())).thenReturn(responseDTO);

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson(usuarioId, productoId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(pedidoId.toString()))
                .andExpect(jsonPath("$.total").value(60.00))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.usuarioNombre").value("Carlos Mendoza"));

        verify(pedidoService, times(1)).crear(any());
    }

    @Test
    @DisplayName("POST /api/pedidos - Debe retornar 400 Bad Request cuando la validación del DTO falla")
    void crear_ValidacionFallida_Retorna400() throws Exception {
        String jsonInvalido = "{}";

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.usuarioId").exists())
                .andExpect(jsonPath("$.errores.direccionEntrega").exists())
                .andExpect(jsonPath("$.errores.detalles").exists());

        verify(pedidoService, never()).crear(any());
    }

    @Test
    @DisplayName("POST /api/pedidos - Debe retornar 400 Bad Request cuando el stock es insuficiente")
    void crear_StockInsuficiente_Retorna400() throws Exception {
        when(pedidoService.crear(any()))
                .thenThrow(new BusinessRuleException("Stock insuficiente para \"Tulipanes Amarillos\". Disponible: 1"));

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson(usuarioId, productoId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.mensaje", containsString("Stock insuficiente")));

        verify(pedidoService, times(1)).crear(any());
    }

    @Test
    @DisplayName("POST /api/pedidos - Debe retornar 404 Not Found cuando el usuario no existe")
    void crear_UsuarioNoEncontrado_Retorna404() throws Exception {
        when(pedidoService.crear(any()))
                .thenThrow(new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId));

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson(usuarioId, productoId)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.mensaje", containsString("Usuario no encontrado")));

        verify(pedidoService, times(1)).crear(any());
    }

    @Test
    @DisplayName("GET /api/pedidos - Debe listar todos los pedidos y retornar 200 OK")
    void listar_Exitoso() throws Exception {
        when(pedidoService.listar()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(pedidoId.toString()));

        verify(pedidoService, times(1)).listar();
    }

    @Test
    @DisplayName("GET /api/pedidos/{id} - Debe buscar pedido por ID y retornar 200 OK")
    void buscarPorId_Exitoso() throws Exception {
        when(pedidoService.buscarPorId(pedidoId)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/pedidos/{id}", pedidoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(pedidoId.toString()));

        verify(pedidoService, times(1)).buscarPorId(pedidoId);
    }

    @Test
    @DisplayName("GET /api/pedidos/{id} - Debe retornar 404 Not Found cuando el pedido no existe")
    void buscarPorId_NoEncontrado_Retorna404() throws Exception {
        when(pedidoService.buscarPorId(pedidoId))
                .thenThrow(new ResourceNotFoundException("Pedido no encontrado con ID: " + pedidoId));

        mockMvc.perform(get("/api/pedidos/{id}", pedidoId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(pedidoService, times(1)).buscarPorId(pedidoId);
    }

    @Test
    @DisplayName("GET /api/pedidos/usuario/{usuarioId} - Debe listar pedidos por usuario y retornar 200 OK")
    void listarPorUsuario_Exitoso() throws Exception {
        when(pedidoService.listarPorUsuario(usuarioId)).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/pedidos/usuario/{usuarioId}", usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(pedidoService, times(1)).listarPorUsuario(usuarioId);
    }

    @Test
    @DisplayName("PATCH /api/pedidos/{id}/estado - Debe cambiar el estado del pedido y retornar 200 OK")
    void cambiarEstado_Exitoso() throws Exception {
        responseDTO.setEstado(EstadoPedido.PAGADO);
        when(pedidoService.cambiarEstado(eq(pedidoId), eq(EstadoPedido.PAGADO))).thenReturn(responseDTO);

        mockMvc.perform(patch("/api/pedidos/{id}/estado", pedidoId)
                        .param("nuevoEstado", "PAGADO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PAGADO"));

        verify(pedidoService, times(1)).cambiarEstado(eq(pedidoId), eq(EstadoPedido.PAGADO));
    }
}
