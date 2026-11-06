package com.sistema.FloreriaBack.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class EmailUtilsTest {

    @Test
    @DisplayName("Quita espacios y pasa el email a minúsculas")
    void normalizar() {
        assertEquals("ana@correo.com", EmailUtils.normalizar("  Ana@Correo.COM "));
    }

    @Test
    @DisplayName("Un email ya normalizado no cambia")
    void normalizar_yaNormalizado() {
        assertEquals("ana@correo.com", EmailUtils.normalizar("ana@correo.com"));
    }

    @Test
    @DisplayName("Un valor nulo devuelve nulo")
    void normalizar_nulo() {
        assertNull(EmailUtils.normalizar(null));
    }
}
