package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class UsuarioRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario ana;

    @BeforeEach
    void setUp() {
        ana = entityManager.persistAndFlush(Usuario.builder()
                .nombre("Ana")
                .email("ana@correo.com")
                .contrasena("hash")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build());
    }

    @Test
    @DisplayName("findByEmailIgnoreCase encuentra al usuario sin distinguir mayúsculas")
    void findByEmailIgnoreCase() {
        assertEquals(ana.getId(), usuarioRepository.findByEmailIgnoreCase("ANA@Correo.com").orElseThrow().getId());
        assertTrue(usuarioRepository.findByEmailIgnoreCase("otra@correo.com").isEmpty());
    }

    @Test
    @DisplayName("existsByEmailIgnoreCase detecta el email sin distinguir mayúsculas")
    void existsByEmailIgnoreCase() {
        assertTrue(usuarioRepository.existsByEmailIgnoreCase("Ana@CORREO.com"));
        assertFalse(usuarioRepository.existsByEmailIgnoreCase("otra@correo.com"));
    }

    @Test
    @DisplayName("existsByEmailIgnoreCaseAndIdNot permite el mismo email en su propio registro")
    void existsByEmailIgnoreCaseAndIdNot_mismoId() {
        assertFalse(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("ANA@correo.com", ana.getId()));
    }

    @Test
    @DisplayName("existsByEmailIgnoreCaseAndIdNot detecta el email usado por otro usuario")
    void existsByEmailIgnoreCaseAndIdNot_otroId() {
        assertTrue(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("ANA@correo.com", UUID.randomUUID()));
    }
}
