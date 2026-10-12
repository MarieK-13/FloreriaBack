package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Categoria;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class CategoriaRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Test
    @DisplayName("existsByNombreIgnoreCase: detecta coincidencia sin importar mayúsculas o minúsculas")
    void existsByNombreIgnoreCase_DetectaCoincidencia() {
        Categoria c = Categoria.builder()
                .nombre("Rosas")
                .descripcion("Rosas variadas")
                .build();
        entityManager.persistAndFlush(c);

        assertTrue(categoriaRepository.existsByNombreIgnoreCase("rosas"));
        assertTrue(categoriaRepository.existsByNombreIgnoreCase("ROSAS"));
        assertFalse(categoriaRepository.existsByNombreIgnoreCase("Girasoles"));
    }

    @Test
    @DisplayName("existsByNombreIgnoreCaseAndIdNot: valida duplicado ignorando el id propio")
    void existsByNombreIgnoreCaseAndIdNot_ValidaDuplicado() {
        Categoria c1 = Categoria.builder()
                .nombre("Rosas")
                .descripcion("Rosas rojas")
                .build();
        Categoria c2 = Categoria.builder()
                .nombre("Tulipanes")
                .descripcion("Tulipanes holandeses")
                .build();

        UUID idRosas = entityManager.persistAndFlush(c1).getId();
        UUID idTulipanes = entityManager.persistAndFlush(c2).getId();

        assertFalse(categoriaRepository.existsByNombreIgnoreCaseAndIdNot("ROSAS", idRosas));
        assertTrue(categoriaRepository.existsByNombreIgnoreCaseAndIdNot("ROSAS", idTulipanes));
    }
}
