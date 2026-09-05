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
import org.mockito.ArgumentCaptor;
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
    private PasswordEncoder passwordEncoder;

    private UsuarioMapper usuarioMapper;

    private UsuarioServiceImpl usuarioService;

    private Usuario usuario;
    private UsuarioRequestDTO requestDTO;
    private UUID usuarioId;

    @BeforeEach
    void setUp() {
        usuarioMapper = new UsuarioMapper();
        usuarioService = new UsuarioServiceImpl(usuarioRepository, usuarioMapper, passwordEncoder);

        usuarioId = UUID.randomUUID();

        usuario = Usuario.builder()
                .id(usuarioId)
                .nombre("Juan Perez")
                .email("juan@example.com")
                .contrasena("password123")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build();

        requestDTO = new UsuarioRequestDTO();
        requestDTO.setNombre("Juan Perez");
        requestDTO.setEmail("juan@example.com");
        requestDTO.setContrasena("password123");
        requestDTO.setRol(RolUsuario.CLIENTE);
    }

    @Test
    @DisplayName("Debe registrar un usuario y guardar la contraseña ya hasheada, no en texto plano")
    void registrar_Exitoso() {
        when(usuarioRepository.existsByEmail("juan@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hash_encriptado");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioResponseDTO resultado = usuarioService.registrar(requestDTO);

        assertNotNull(resultado);
        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());

        assertEquals("hash_encriptado", captor.getValue().getContrasena());
        assertNotEquals("password123", captor.getValue().getContrasena());
        verify(passwordEncoder, times(1)).encode("password123");
    }

    @Test
    @DisplayName("Debe lanzar BusinessRuleException al registrar con un email ya existente")
    void registrar_EmailExistente_LanzaExcepcion() {
        when(usuarioRepository.existsByEmail("juan@example.com")).thenReturn(true);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> usuarioService.registrar(requestDTO));

        assertTrue(ex.getMessage().contains("Ya existe un usuario con ese email"));
        verify(usuarioRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("Debe listar todos los usuarios")
    void listar_Exitoso() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));

        List<UsuarioResponseDTO> resultado = usuarioService.listar();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Juan Perez", resultado.get(0).getNombre());
        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe buscar un usuario por id exitosamente")
    void buscarPorId_Exitoso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));

        UsuarioResponseDTO resultado = usuarioService.buscarPorId(usuarioId);

        assertNotNull(resultado);
        assertEquals(usuarioId, resultado.getId());
        verify(usuarioRepository, times(1)).findById(usuarioId);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException al buscar un id inexistente")
    void buscarPorId_NoEncontrado_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> usuarioService.buscarPorId(usuarioId));

        verify(usuarioRepository, times(1)).findById(usuarioId);
    }
}
