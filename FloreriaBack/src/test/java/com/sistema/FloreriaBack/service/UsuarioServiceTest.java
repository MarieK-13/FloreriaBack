package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.UsuarioMapper;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioMapper usuarioMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    private Usuario usuario;
    private UsuarioRequestDTO requestDTO;
    private UsuarioResponseDTO responseDTO;
    private UUID usuarioId;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();

        usuario = Usuario.builder()
                .id(usuarioId)
                .nombre("Juan Pérez")
                .email("juan@example.com")
                .contrasena("password123")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build();

        requestDTO = new UsuarioRequestDTO();
        requestDTO.setNombre("Juan Pérez");
        requestDTO.setEmail("juan@example.com");
        requestDTO.setContrasena("password123");

        responseDTO = new UsuarioResponseDTO(
                usuarioId,
                "Juan Pérez",
                "juan@example.com",
                RolUsuario.CLIENTE,
                true
        );
    }

    @Test
    @DisplayName("Debe registrar un usuario exitosamente encriptando su contraseña")
    void registrar_Exitoso() {
        when(usuarioRepository.existsByEmail("juan@example.com")).thenReturn(false);
        when(usuarioMapper.toEntity(requestDTO)).thenReturn(usuario);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(usuarioRepository.save(usuario)).thenReturn(usuario);
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(responseDTO);

        UsuarioResponseDTO resultado = usuarioService.registrar(requestDTO);

        assertNotNull(resultado);
        assertEquals(usuarioId, resultado.getId());
        assertEquals("juan@example.com", resultado.getEmail());

        verify(usuarioRepository, times(1)).existsByEmail("juan@example.com");
        verify(passwordEncoder, times(1)).encode("password123");
        verify(usuarioRepository, times(1)).save(usuario);
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException al registrar usuario con email existente")
    void registrar_EmailExistente_LanzaExcepcion() {
        when(usuarioRepository.existsByEmail("juan@example.com")).thenReturn(true);

        BusinessRuleException exception = assertThrows(
                BusinessRuleException.class,
                () -> usuarioService.registrar(requestDTO)
        );

        assertTrue(exception.getMessage().contains("Ya existe un usuario con ese email"));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe listar todos los usuarios")
    void listar_Exitoso() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(responseDTO);

        List<UsuarioResponseDTO> resultado = usuarioService.listar();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Juan Pérez", resultado.get(0).getNombre());

        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe buscar un usuario por ID exitosamente")
    void buscarPorId_Exitoso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toResponseDTO(usuario)).thenReturn(responseDTO);

        UsuarioResponseDTO resultado = usuarioService.buscarPorId(usuarioId);

        assertNotNull(resultado);
        assertEquals(usuarioId, resultado.getId());

        verify(usuarioRepository, times(1)).findById(usuarioId);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al buscar por ID inexistente")
    void buscarPorId_NoEncontrado_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> usuarioService.buscarPorId(usuarioId)
        );

        verify(usuarioRepository, times(1)).findById(usuarioId);
    }
}
