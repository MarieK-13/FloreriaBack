package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Categoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class CategoriaRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CategoriaRepository categoriaRepository;

    private Categoria rosas;

    @BeforeEach
    void setUp() {
        rosas = entityManager.persistAndFlush(Categoria.builder()
                .nombre("Rosas")
                .descripcion("Arreglos con rosas")
                .build());
    }

    @Test
    @DisplayName("existsByNombreIgnoreCase detecta el nombre sin distinguir mayúsculas")
    void existsByNombreIgnoreCase() {
        assertTrue(categoriaRepository.existsByNombreIgnoreCase("rOSAS"));
        assertFalse(categoriaRepository.existsByNombreIgnoreCase("Girasoles"));
    }

    @Test
    @DisplayName("existsByNombreIgnoreCaseAndIdNot permite el mismo nombre en su propio registro")
    void existsByNombreIgnoreCaseAndIdNot_mismoId() {
        assertFalse(categoriaRepository.existsByNombreIgnoreCaseAndIdNot("rosas", rosas.getId()));
    }

    @Test
    @DisplayName("existsByNombreIgnoreCaseAndIdNot detecta el nombre usado por otro registro")
    void existsByNombreIgnoreCaseAndIdNot_otroId() {
        assertTrue(categoriaRepository.existsByNombreIgnoreCaseAndIdNot("ROSAS", UUID.randomUUID()));
    }
}
