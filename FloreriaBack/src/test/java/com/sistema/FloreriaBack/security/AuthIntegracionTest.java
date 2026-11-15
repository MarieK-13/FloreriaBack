package com.sistema.FloreriaBack.security;

import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de punta a punta de /api/auth (registro, login y /me) con la base H2 de pruebas.
 * Cada prueba usa un email distinto para no depender del orden de ejecución.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegracionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    private static String emailUnico() {
        return "cliente." + UUID.randomUUID().toString().substring(0, 8) + "@test.com";
    }

    private static String jsonRegistro(String nombre, String email, String contrasena) {
        return jsonRegistro(nombre, "Pérez", email, "987654321", contrasena);
    }

    private static String jsonRegistro(String nombre, String apellidos, String email,
                                       String telefono, String contrasena) {
        return jsonRegistro(nombre, apellidos, email, telefono, contrasena, true);
    }

    private static String jsonRegistro(String nombre, String apellidos, String email,
                                       String telefono, String contrasena, boolean aceptaTerminos) {
        return String.format(
                "{\"nombre\":\"%s\",\"apellidos\":\"%s\",\"email\":\"%s\","
                        + "\"telefono\":\"%s\",\"contrasena\":\"%s\",\"aceptaTerminos\":%s}",
                nombre, apellidos, email, telefono, contrasena, aceptaTerminos);
    }

    private static String jsonLogin(String email, String contrasena) {
        return String.format("{\"email\":\"%s\",\"contrasena\":\"%s\"}", email, contrasena);
    }

    // ---------- REGISTRO ----------

    @Test
    @DisplayName("POST /api/auth/register - Datos válidos crea un CLIENTE y devuelve 201 con token")
    void registro_DatosValidos_Retorna201ConTokenYRolCliente() throws Exception {
        String email = emailUnico();

        MvcResult resultado = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("María", "Pérez Soto", email, "+51 987 654 321", "Clave123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.nombre").value("María"))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.rol").value("CLIENTE"))
                .andReturn();

        // La contraseña se guarda cifrada, nunca en texto plano
        Usuario guardado = usuarioRepository.findByEmail(email).orElseThrow();
        assertThat(guardado.getApellidos()).isEqualTo("Pérez Soto");
        assertThat(guardado.getTelefono()).isEqualTo("+51987654321"); // sin espacios y con prefijo
        assertThat(guardado.getContrasena()).isNotEqualTo("Clave123");
        assertThat(passwordEncoder.matches("Clave123", guardado.getContrasena())).isTrue();
        assertThat(guardado.isActivo()).isTrue();
        assertThat(guardado.getTerminosAceptadosEn()).isNotNull();
        assertThat(resultado.getResponse().getContentAsString()).doesNotContain("Clave123");
    }

    @Test
    @DisplayName("POST /api/auth/register - Aunque envíe rol ADMINISTRADOR, se crea como CLIENTE")
    void registro_IntentandoElegirRolAdmin_SeCreaComoCliente() throws Exception {
        String email = emailUnico();
        String json = String.format(
                "{\"nombre\":\"Intruso\",\"apellidos\":\"X\",\"email\":\"%s\",\"telefono\":\"987654321\","
                        + "\"contrasena\":\"Clave123\",\"aceptaTerminos\":true,\"rol\":\"ADMINISTRADOR\"}",
                email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rol").value("CLIENTE"));

        assertThat(usuarioRepository.findByEmail(email).orElseThrow().getRol())
                .isEqualTo(RolUsuario.CLIENTE);
    }

    @Test
    @DisplayName("POST /api/auth/register - Email con mayúsculas y espacios se guarda normalizado")
    void registro_EmailConMayusculas_SeGuardaEnMinusculas() throws Exception {
        String email = emailUnico();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("Ana", "  " + email.toUpperCase() + "  ", "Clave123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    @DisplayName("POST /api/auth/register - Email ya registrado (sin importar mayúsculas) devuelve 400")
    void registro_EmailRepetido_Retorna400() throws Exception {
        String email = emailUnico();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("Primero", email, "Clave123")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("Segundo", email.toUpperCase(), "Clave456")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Ya existe un usuario con ese email"));
    }

    @Test
    @DisplayName("POST /api/auth/register - Datos inválidos devuelve 400 con el error de cada campo")
    void registro_DatosInvalidos_Retorna400ConErroresPorCampo() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("", "", "no-es-un-email", "12345", "123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.nombre", notNullValue()))
                .andExpect(jsonPath("$.errores.apellidos", notNullValue()))
                .andExpect(jsonPath("$.errores.email", notNullValue()))
                .andExpect(jsonPath("$.errores.telefono", notNullValue()))
                .andExpect(jsonPath("$.errores.contrasena", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/auth/register - Contraseña de más de 72 caracteres devuelve 400")
    void registro_ContrasenaMuyLarga_Retorna400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("Ana", emailUnico(), "a".repeat(73))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.contrasena")
                        .value("La contraseña debe tener entre 6 y 72 caracteres"));
    }

    @Test
    @DisplayName("POST /api/auth/register - Sin aceptar los términos devuelve 400 y no crea el usuario")
    void registro_SinAceptarTerminos_Retorna400() throws Exception {
        String email = emailUnico();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("Ana", "Torres", email, "987654321", "Clave123", false)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.aceptaTerminos")
                        .value("Debe aceptar los términos y la política de privacidad"));

        assertThat(usuarioRepository.findByEmail(email)).isEmpty();
    }

    @Test
    @DisplayName("POST /api/auth/register - Celular que no empieza en 9 devuelve 400")
    void registro_TelefonoInvalido_Retorna400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("Ana", "Torres", emailUnico(), "887654321", "Clave123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.telefono", notNullValue()));
    }

    // ---------- LOGIN ----------

    @Test
    @DisplayName("Registro y luego login con email en mayúsculas y espacios funciona")
    void login_DespuesDeRegistrarse_SinImportarMayusculas_Retorna200() throws Exception {
        String email = emailUnico();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("Lucía", email, "Clave123")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonLogin("  " + email.toUpperCase() + "  ", "Clave123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.rol").value("CLIENTE"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Email que no existe devuelve 401 (mismo mensaje que contraseña errónea)")
    void login_EmailInexistente_Retorna401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonLogin(emailUnico(), "Clave123")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Email o contraseña incorrectos"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Usuario inactivo devuelve 403")
    void login_UsuarioInactivo_Retorna403() throws Exception {
        String email = emailUnico();
        usuarioRepository.save(Usuario.builder()
                .nombre("Inactivo")
                .email(email)
                .contrasena(passwordEncoder.encode("Clave123"))
                .rol(RolUsuario.CLIENTE)
                .activo(false)
                .build());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonLogin(email, "Clave123")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("El usuario está inactivo"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Campos vacíos devuelve 400")
    void login_CamposVacios_Retorna400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonLogin("", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.email", notNullValue()))
                .andExpect(jsonPath("$.errores.contrasena", notNullValue()));
    }

    // ---------- /me ----------

    @Test
    @DisplayName("GET /api/auth/me - Con token devuelve los datos del usuario (con apellidos y teléfono), sin contraseña")
    void me_ConToken_Retorna200ConDatosDelUsuario() throws Exception {
        String email = emailUnico();
        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .nombre("Con Token")
                .apellidos("Apellido")
                .telefono("+51987654321")
                .email(email)
                .contrasena(passwordEncoder.encode("Clave123"))
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build());
        String token = jwtUtils.generarToken(UsuarioPrincipal.desde(usuario));

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.apellidos").value("Apellido"))
                .andExpect(jsonPath("$.telefono").value("+51987654321"))
                .andExpect(jsonPath("$.rol").value("CLIENTE"))
                .andExpect(jsonPath("$.contrasena").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/auth/me - Sin token devuelve 401")
    void me_SinToken_Retorna401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
