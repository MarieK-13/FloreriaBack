package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.request.UsuarioUpdateRequestDTO;
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

    private UsuarioUpdateRequestDTO cambios(String email, RolUsuario rol, String contrasena) {
        return new UsuarioUpdateRequestDTO("Juan Pérez Actualizado", email, rol, contrasena);
    }

    @Test
    @DisplayName("Actualizar: cambia los datos y conserva la contraseña si no se envía una nueva")
    void actualizar_SinContrasena_ConservaLaActual() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("juan@example.com", usuarioId)).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponseDTO resultado = usuarioService.actualizar(usuarioId,
                cambios("juan@example.com", RolUsuario.OPERARIO, null), UUID.randomUUID());

        assertEquals("Juan Pérez Actualizado", resultado.getNombre());
        assertEquals(RolUsuario.OPERARIO, resultado.getRol());
        assertEquals("password123", usuario.getContrasena());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("Actualizar: una contraseña vacía significa 'no cambiar'")
    void actualizar_ContrasenaVacia_NoLaCambia() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("juan@example.com", usuarioId)).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        usuarioService.actualizar(usuarioId, cambios("juan@example.com", RolUsuario.CLIENTE, ""), UUID.randomUUID());

        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("Actualizar: la contraseña nueva se guarda cifrada, nunca en texto plano")
    void actualizar_ConContrasenaNueva_SeCifra() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("nuevaClave1")).thenReturn("hash_nuevo");
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("juan@example.com", usuarioId)).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        usuarioService.actualizar(usuarioId, cambios("juan@example.com", RolUsuario.CLIENTE, "nuevaClave1"),
                UUID.randomUUID());

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertEquals("hash_nuevo", captor.getValue().getContrasena());
        assertNotEquals("nuevaClave1", captor.getValue().getContrasena());
    }

    @Test
    @DisplayName("Actualizar: lanza BusinessRuleException (400) si el nuevo email ya existe")
    void actualizar_EmailDuplicado_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("otro@example.com", usuarioId)).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> usuarioService.actualizar(usuarioId,
                cambios("otro@example.com", RolUsuario.CLIENTE, null), UUID.randomUUID()));

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Actualizar: lanza ResourceNotFoundException (404) si el usuario no existe")
    void actualizar_NoEncontrado_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> usuarioService.actualizar(usuarioId,
                cambios("juan@example.com", RolUsuario.CLIENTE, null), UUID.randomUUID()));
    }

    @Test
    @DisplayName("Actualizar: un administrador no puede quitarse su propio rol")
    void actualizar_AdminSeQuitaElRol_LanzaExcepcion() {
        usuario.setRol(RolUsuario.ADMINISTRADOR);
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("juan@example.com", usuarioId)).thenReturn(false);

        assertThrows(BusinessRuleException.class, () -> usuarioService.actualizar(usuarioId,
                cambios("juan@example.com", RolUsuario.CLIENTE, null), usuarioId));

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Desactivar: cambia activo a false (borrado lógico)")
    void desactivar_Exitoso() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponseDTO resultado = usuarioService.cambiarEstado(usuarioId, false, UUID.randomUUID());

        assertFalse(resultado.isActivo());
        verify(usuarioRepository, never()).delete(any());
        verify(usuarioRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Activar: cambia activo a true")
    void activar_Exitoso() {
        usuario.setActivo(false);
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponseDTO resultado = usuarioService.cambiarEstado(usuarioId, true, UUID.randomUUID());

        assertTrue(resultado.isActivo());
    }

    @Test
    @DisplayName("Desactivar: un administrador no puede desactivar su propia cuenta")
    void desactivar_ASiMismo_LanzaExcepcion() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));

        assertThrows(BusinessRuleException.class,
                () -> usuarioService.cambiarEstado(usuarioId, false, usuarioId));

        assertTrue(usuario.isActivo());
        verify(usuarioRepository, never()).save(any());
    }
}
