package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UsuarioRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    @DisplayName("existsByEmailIgnoreCase: detecta email existente sin importar mayúsculas o minúsculas")
    void existsByEmailIgnoreCase_DetectaCoincidencia() {
        Usuario u = Usuario.builder()
                .nombre("Juan")
                .email("juan@example.com")
                .contrasena("hash123")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build();
        entityManager.persistAndFlush(u);

        assertTrue(usuarioRepository.existsByEmailIgnoreCase("JUAN@EXAMPLE.COM"));
        assertTrue(usuarioRepository.existsByEmailIgnoreCase("Juan@Example.Com"));
        assertFalse(usuarioRepository.existsByEmailIgnoreCase("otro@example.com"));
    }

    @Test
    @DisplayName("existsByEmailIgnoreCaseAndIdNot: valida duplicado ignorando el id propio")
    void existsByEmailIgnoreCaseAndIdNot_ValidaDuplicado() {
        Usuario u1 = Usuario.builder()
                .nombre("Juan")
                .email("juan@example.com")
                .contrasena("hash123")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build();
        Usuario u2 = Usuario.builder()
                .nombre("Maria")
                .email("maria@example.com")
                .contrasena("hash456")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build();

        UUID idJuan = entityManager.persistAndFlush(u1).getId();
        UUID idMaria = entityManager.persistAndFlush(u2).getId();

        assertFalse(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("JUAN@EXAMPLE.COM", idJuan));
        assertTrue(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("JUAN@EXAMPLE.COM", idMaria));
    }
}
