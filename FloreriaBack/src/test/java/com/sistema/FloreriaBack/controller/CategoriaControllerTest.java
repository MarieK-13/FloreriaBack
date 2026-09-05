package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.response.CategoriaResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.GlobalExceptionHandler;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.service.CategoriaService;
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
class CategoriaControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CategoriaService categoriaService;

    @InjectMocks
    private CategoriaController categoriaController;

    private CategoriaResponseDTO responseDTO;
    private UUID categoriaId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoriaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        categoriaId = UUID.randomUUID();

        responseDTO = new CategoriaResponseDTO(
                categoriaId,
                "Orquídeas",
                "Variedad de orquídeas exóticas"
        );
    }

    private String crearRequestJson() {
        return """
                {
                    "nombre": "Orquídeas",
                    "descripcion": "Variedad de orquídeas exóticas"
                }
                """;
    }

    @Test
    @DisplayName("POST /api/categorias - Debe registrar una categoría exitosamente y retornar 201 Created")
    void registrar_Exitoso() throws Exception {
        when(categoriaService.registrar(any())).thenReturn(responseDTO);

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(crearRequestJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(categoriaId.toString()))
                .andExpect(jsonPath("$.nombre").value("Orquídeas"));

        verify(categoriaService, times(1)).registrar(any());
    }

    @Test
    @DisplayName("POST /api/categorias - Debe retornar 400 Bad Request cuando la validación del DTO falla")
    void registrar_ValidacionFallida_Retorna400() throws Exception {
        String jsonInvalido = "{}";

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores.nombre").exists());

        verify(categoriaService, never()).registrar(any());
    }

    @Test
    @DisplayName("GET /api/categorias - Debe listar todas las categorías y retornar 200 OK")
    void listar_Exitoso() throws Exception {
        when(categoriaService.listar()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre").value("Orquídeas"));

        verify(categoriaService, times(1)).listar();
    }

    @Test
    @DisplayName("GET /api/categorias/{id} - Debe buscar categoría por ID y retornar 200 OK")
    void buscarPorId_Exitoso() throws Exception {
        when(categoriaService.buscarPorId(categoriaId)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/categorias/{id}", categoriaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(categoriaId.toString()));

        verify(categoriaService, times(1)).buscarPorId(categoriaId);
    }

    @Test
    @DisplayName("GET /api/categorias/{id} - Debe retornar 404 Not Found cuando la categoría no existe")
    void buscarPorId_NoEncontrado_Retorna404() throws Exception {
        when(categoriaService.buscarPorId(categoriaId))
                .thenThrow(new ResourceNotFoundException("Categoría no encontrada: " + categoriaId));

        mockMvc.perform(get("/api/categorias/{id}", categoriaId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(categoriaService, times(1)).buscarPorId(categoriaId);
    }

    @Test
    @DisplayName("DELETE /api/categorias/{id} - Debe eliminar categoría y retornar 204 No Content")
    void eliminar_Exitoso() throws Exception {
        doNothing().when(categoriaService).eliminar(categoriaId);

        mockMvc.perform(delete("/api/categorias/{id}", categoriaId))
                .andExpect(status().isNoContent());

        verify(categoriaService, times(1)).eliminar(categoriaId);
    }

    @Test
    @DisplayName("DELETE /api/categorias/{id} - Debe retornar 400 Bad Request si la categoría tiene productos asociados")
    void eliminar_ConProductos_Retorna400() throws Exception {
        doThrow(new BusinessRuleException("No se puede eliminar la categoría porque tiene productos asociados"))
                .when(categoriaService).eliminar(categoriaId);

        mockMvc.perform(delete("/api/categorias/{id}", categoriaId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.mensaje", containsString("tiene productos asociados")));

        verify(categoriaService, times(1)).eliminar(categoriaId);
    }
}
