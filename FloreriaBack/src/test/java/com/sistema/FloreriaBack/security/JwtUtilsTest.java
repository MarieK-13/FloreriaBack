package com.sistema.FloreriaBack.security;

import com.sistema.FloreriaBack.model.enums.RolUsuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private static final String SECRETO = "clave-de-prueba-para-tests-de-floriasmart-2026";

    private JwtUtils jwtUtils;
    private UsuarioPrincipal cliente;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils(SECRETO, 3_600_000L);
        cliente = new UsuarioPrincipal(UUID.randomUUID(), "Ana", "ana@correo.com",
                "hash", RolUsuario.CLIENTE, true);
    }

    @Test
    @DisplayName("Genera un token del que se puede recuperar el email")
    void generarToken_YObtenerEmail() {
        String token = jwtUtils.generarToken(cliente);

        assertNotNull(token);
        assertEquals("ana@correo.com", jwtUtils.obtenerEmail(token));
        assertTrue(jwtUtils.esTokenValido(token, cliente));
    }

    @Test
    @DisplayName("Un token no es válido para otro usuario")
    void tokenDeOtroUsuario_NoEsValido() {
        String token = jwtUtils.generarToken(cliente);
        UsuarioPrincipal otro = new UsuarioPrincipal(UUID.randomUUID(), "Luis", "luis@correo.com",
                "hash", RolUsuario.CLIENTE, true);

        assertFalse(jwtUtils.esTokenValido(token, otro));
    }

    @Test
    @DisplayName("Un token alterado no es válido")
    void tokenAlterado_NoEsValido() {
        String token = jwtUtils.generarToken(cliente);
        String alterado = token.substring(0, token.length() - 4) + "abcd";

        assertFalse(jwtUtils.esTokenValido(alterado, cliente));
    }

    @Test
    @DisplayName("Un token firmado con otra clave no es válido")
    void tokenConOtraClave_NoEsValido() {
        JwtUtils otraApp = new JwtUtils("otra-clave-distinta-de-al-menos-32-caracteres", 3_600_000L);
        String token = otraApp.generarToken(cliente);

        assertFalse(jwtUtils.esTokenValido(token, cliente));
    }

    @Test
    @DisplayName("Un token expirado no es válido")
    void tokenExpirado_NoEsValido() {
        JwtUtils expiraAlInstante = new JwtUtils(SECRETO, -1_000L);
        String token = expiraAlInstante.generarToken(cliente);

        assertFalse(jwtUtils.esTokenValido(token, cliente));
    }

    @Test
    @DisplayName("Rechaza claves secretas de menos de 32 caracteres")
    void claveCorta_LanzaExcepcion() {
        assertThrows(IllegalStateException.class, () -> new JwtUtils("corta", 3_600_000L));
    }
}
