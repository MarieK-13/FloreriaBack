package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest extends BaseControllerTest{

    private MockMvc mockMvc;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private UsuarioController usuarioController;

    private UsuarioResponseDTO responseDTO;
    private UUID usuarioId;

    @BeforeEach
    void setUp() {
        mockMvc = crearMockMvc(usuarioController);

        usuarioId = UUID.randomUUID();

        responseDTO = new UsuarioResponseDTO(
                usuarioId,
                "Juan Pérez",
                "juan@example.com",
                RolUsuario.CLIENTE,
                true
        );
    }

    private String crearRequestJson() {
        return """
                {
                    "nombre": "Juan Pérez",
                    "email": "juan@example.com",
                    "contrasena": "password123",
                    "rol": "CLIENTE"
                }
                """;
    }

    @Test
    @DisplayName("POST /api/usuarios - Debe registrar un usuario exitosamente y retornar 201 Created")
    void registrar_Exitoso() throws Exception {
        when(usuarioService.registrar(any())).thenReturn(responseDTO);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(usuarioId.toString()))
                .andExpect(jsonPath("$.email").value("juan@example.com"));

        verify(usuarioService, times(1)).registrar(any());
    }

    @Test
    @DisplayName("POST /api/usuarios - Debe retornar 400 Bad Request cuando la validación del DTO falla")
    void registrar_ValidacionFallida_Retorna400() throws Exception {
        String jsonInvalido = "{}";

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.nombre").exists())
                .andExpect(jsonPath("$.errores.email").exists())
                .andExpect(jsonPath("$.errores.contrasena").exists());

        verify(usuarioService, never()).registrar(any());
    }

    @Test
    @DisplayName("POST /api/usuarios - Debe retornar 400 Bad Request cuando el email ya existe")
    void registrar_EmailDuplicado_Retorna400() throws Exception {
        when(usuarioService.registrar(any()))
                .thenThrow(new BusinessRuleException("Ya existe un usuario con ese email"));

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.mensaje", containsString("Ya existe un usuario con ese email")));

        verify(usuarioService, times(1)).registrar(any());
    }

    @Test
    @DisplayName("GET /api/usuarios - Debe listar todos los usuarios y retornar 200 OK")
    void listar_Exitoso() throws Exception {
        when(usuarioService.listar()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre").value("Juan Pérez"));

        verify(usuarioService, times(1)).listar();
    }

    @Test
    @DisplayName("GET /api/usuarios/{id} - Debe buscar un usuario por ID y retornar 200 OK")
    void buscarPorId_Exitoso() throws Exception {
        when(usuarioService.buscarPorId(usuarioId)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/usuarios/{id}", usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(usuarioId.toString()));

        verify(usuarioService, times(1)).buscarPorId(usuarioId);
    }

    @Test
    @DisplayName("GET /api/usuarios/{id} - Debe retornar 404 Not Found cuando el usuario no existe")
    void buscarPorId_NoEncontrado_Retorna404() throws Exception {
        when(usuarioService.buscarPorId(usuarioId))
                .thenThrow(new ResourceNotFoundException("Usuario no encontrado: " + usuarioId));

        mockMvc.perform(get("/api/usuarios/{id}", usuarioId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(usuarioService, times(1)).buscarPorId(usuarioId);
    }

    @Test
    @DisplayName("POST /api/usuarios - La respuesta NUNCA debe exponer la contraseña")
    void registrar_NuncaExponeContrasena() throws Exception {
        when(usuarioService.registrar(any())).thenReturn(responseDTO);

         mockMvc.perform(post("/api/usuarios")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(crearRequestJson()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.contrasena").doesNotExist());
    }
}
