package com.sistema.FloreriaBack.security;

import com.jayway.jsonpath.JsonPath;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas del CRUD de la cuenta propia ("Mi cuenta"): /api/auth/me.
 * Cada prueba crea su propio cliente para no depender de las demás.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CuentaIntegracionTest {

    private static final String CLAVE = "Clave123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    private Usuario cliente;
    private String token;

    @BeforeEach
    void setUp() {
        cliente = crearUsuario(RolUsuario.CLIENTE);
        token = jwtUtils.generarToken(UsuarioPrincipal.desde(cliente));
    }

    private Usuario crearUsuario(RolUsuario rol) {
        return usuarioRepository.save(Usuario.builder()
                .nombre("Ana")
                .apellidos("Torres")
                .telefono("+51987654321")
                .email("cuenta." + UUID.randomUUID().toString().substring(0, 8) + "@test.com")
                .contrasena(passwordEncoder.encode(CLAVE))
                .rol(rol)
                .activo(true)
                .build());
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    // ---------- READ ----------

    @Test
    @DisplayName("GET /api/auth/me - Devuelve todos los datos del perfil")
    void obtener_ConToken_Retorna200() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Ana"))
                .andExpect(jsonPath("$.apellidos").value("Torres"))
                .andExpect(jsonPath("$.telefono").value("+51987654321"))
                .andExpect(jsonPath("$.email").value(cliente.getEmail()))
                .andExpect(jsonPath("$.contrasena").doesNotExist());
    }

    // ---------- UPDATE: datos personales ----------

    @Test
    @DisplayName("PUT /api/auth/me - Actualiza nombres, apellidos, teléfono, distrito y dirección")
    void actualizarPerfil_DatosValidos_Retorna200() throws Exception {
        String json = "{\"nombre\":\" Ana María \",\"apellidos\":\"Torres Ríos\",\"telefono\":\"912 345 678\","
                + "\"distrito\":\"Ica\",\"direccion\":\"Av. Grau 123\"}";

        mockMvc.perform(put("/api/auth/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Ana María"))
                .andExpect(jsonPath("$.apellidos").value("Torres Ríos"))
                .andExpect(jsonPath("$.telefono").value("+51912345678"))
                .andExpect(jsonPath("$.distrito").value("Ica"))
                .andExpect(jsonPath("$.direccion").value("Av. Grau 123"));

        Usuario guardado = usuarioRepository.findById(cliente.getId()).orElseThrow();
        assertThat(guardado.getDireccion()).isEqualTo("Av. Grau 123");
        assertThat(guardado.getEmail()).isEqualTo(cliente.getEmail()); // el correo no se toca aquí
        assertThat(guardado.getRol()).isEqualTo(RolUsuario.CLIENTE);   // ni el rol
    }

    @Test
    @DisplayName("PUT /api/auth/me - Distrito y dirección vacíos se guardan como null")
    void actualizarPerfil_CamposOpcionalesVacios_SeGuardanNull() throws Exception {
        String json = "{\"nombre\":\"Ana\",\"apellidos\":\"Torres\",\"telefono\":\"987654321\","
                + "\"distrito\":\"   \",\"direccion\":\"\"}";

        mockMvc.perform(put("/api/auth/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.distrito").doesNotExist())
                .andExpect(jsonPath("$.direccion").doesNotExist());
    }

    @Test
    @DisplayName("PUT /api/auth/me - Datos inválidos devuelve 400 por campo")
    void actualizarPerfil_DatosInvalidos_Retorna400() throws Exception {
        String json = "{\"nombre\":\"\",\"apellidos\":\"\",\"telefono\":\"123\"}";

        mockMvc.perform(put("/api/auth/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.nombre", notNullValue()))
                .andExpect(jsonPath("$.errores.apellidos", notNullValue()))
                .andExpect(jsonPath("$.errores.telefono", notNullValue()));
    }

    @Test
    @DisplayName("PUT /api/auth/me - Sin token devuelve 401")
    void actualizarPerfil_SinToken_Retorna401() throws Exception {
        mockMvc.perform(put("/api/auth/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Ana\",\"apellidos\":\"Torres\",\"telefono\":\"987654321\"}"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- UPDATE: contraseña ----------

    @Test
    @DisplayName("PUT /api/auth/me/contrasena - Con la contraseña actual correcta la cambia (204) y permite entrar con la nueva")
    void cambiarContrasena_Correcta_Retorna204() throws Exception {
        mockMvc.perform(put("/api/auth/me/contrasena")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"contrasenaActual\":\"Clave123\",\"nuevaContrasena\":\"Nueva456\","
                                + "\"confirmacion\":\"Nueva456\"}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + cliente.getEmail() + "\",\"contrasena\":\"Nueva456\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + cliente.getEmail() + "\",\"contrasena\":\"Clave123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/auth/me/contrasena - Contraseña actual incorrecta devuelve 400 (no 401)")
    void cambiarContrasena_ActualIncorrecta_Retorna400() throws Exception {
        mockMvc.perform(put("/api/auth/me/contrasena")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"contrasenaActual\":\"Equivocada1\",\"nuevaContrasena\":\"Nueva456\","
                                + "\"confirmacion\":\"Nueva456\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("La contraseña actual no es correcta"));
    }

    @Test
    @DisplayName("PUT /api/auth/me/contrasena - Confirmación distinta devuelve 400")
    void cambiarContrasena_ConfirmacionDistinta_Retorna400() throws Exception {
        mockMvc.perform(put("/api/auth/me/contrasena")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"contrasenaActual\":\"Clave123\",\"nuevaContrasena\":\"Nueva456\","
                                + "\"confirmacion\":\"Otra789\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("La confirmación no coincide con la nueva contraseña"));
    }

    @Test
    @DisplayName("PUT /api/auth/me/contrasena - Nueva igual a la actual devuelve 400")
    void cambiarContrasena_IgualALaActual_Retorna400() throws Exception {
        mockMvc.perform(put("/api/auth/me/contrasena")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"contrasenaActual\":\"Clave123\",\"nuevaContrasena\":\"Clave123\","
                                + "\"confirmacion\":\"Clave123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("La nueva contraseña debe ser distinta a la actual"));
    }

    // ---------- UPDATE: correo ----------

    @Test
    @DisplayName("PUT /api/auth/me/email - Cambia el correo, devuelve token nuevo y el token viejo deja de servir")
    void cambiarEmail_Correcto_Retorna200ConTokenNuevo() throws Exception {
        String nuevoEmail = "nuevo." + UUID.randomUUID().toString().substring(0, 8) + "@test.com";

        MvcResult resultado = mockMvc.perform(put("/api/auth/me/email")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nuevoEmail\":\"" + nuevoEmail.toUpperCase() + "\",\"contrasenaActual\":\"Clave123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email").value(nuevoEmail))
                .andReturn();

        String tokenNuevo = JsonPath.read(resultado.getResponse().getContentAsString(), "$.token");

        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(tokenNuevo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(nuevoEmail));

        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + nuevoEmail + "\",\"contrasena\":\"Clave123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/auth/me/email - Correo de otra cuenta devuelve 400")
    void cambiarEmail_YaUsado_Retorna400() throws Exception {
        Usuario otro = crearUsuario(RolUsuario.CLIENTE);

        mockMvc.perform(put("/api/auth/me/email")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nuevoEmail\":\"" + otro.getEmail() + "\",\"contrasenaActual\":\"Clave123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Ya existe un usuario con ese email"));
    }

    @Test
    @DisplayName("PUT /api/auth/me/email - Contraseña incorrecta devuelve 400 y no cambia el correo")
    void cambiarEmail_ContrasenaIncorrecta_Retorna400() throws Exception {
        mockMvc.perform(put("/api/auth/me/email")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nuevoEmail\":\"otro.correo@test.com\",\"contrasenaActual\":\"Mala999\"}"))
                .andExpect(status().isBadRequest());

        assertThat(usuarioRepository.findById(cliente.getId()).orElseThrow().getEmail())
                .isEqualTo(cliente.getEmail());
    }

    // ---------- DELETE ----------

    @Test
    @DisplayName("DELETE /api/auth/me - Con la contraseña correcta elimina la cuenta (204), ya no puede entrar y el correo queda libre")
    void eliminarCuenta_Correcta_Retorna204() throws Exception {
        String email = cliente.getEmail();

        mockMvc.perform(delete("/api/auth/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"contrasena\":\"Clave123\"}"))
                .andExpect(status().isNoContent());

        Usuario eliminado = usuarioRepository.findById(cliente.getId()).orElseThrow();
        assertThat(eliminado.isActivo()).isFalse();
        assertThat(eliminado.getEmail()).isNotEqualTo(email);
        assertThat(eliminado.getTelefono()).isNull();
        assertThat(eliminado.getApellidos()).isNull();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"contrasena\":\"Clave123\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized());

        // Puede volver a registrarse con el mismo correo
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Ana\",\"apellidos\":\"Torres\",\"email\":\"" + email + "\","
                                + "\"telefono\":\"987654321\",\"contrasena\":\"Clave123\",\"aceptaTerminos\":true}"))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("DELETE /api/auth/me - Contraseña incorrecta devuelve 400 y la cuenta sigue activa")
    void eliminarCuenta_ContrasenaIncorrecta_Retorna400() throws Exception {
        mockMvc.perform(delete("/api/auth/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"contrasena\":\"Mala999\"}"))
                .andExpect(status().isBadRequest());

        assertThat(usuarioRepository.findById(cliente.getId()).orElseThrow().isActivo()).isTrue();
    }

    @Test
    @DisplayName("DELETE /api/auth/me - Un administrador no puede eliminar su propia cuenta")
    void eliminarCuenta_Administrador_Retorna400() throws Exception {
        Usuario admin = crearUsuario(RolUsuario.ADMINISTRADOR);
        String tokenAdmin = jwtUtils.generarToken(UsuarioPrincipal.desde(admin));

        mockMvc.perform(delete("/api/auth/me")
                        .header("Authorization", bearer(tokenAdmin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"contrasena\":\"Clave123\"}"))
                .andExpect(status().isBadRequest());

        assertThat(usuarioRepository.findById(admin.getId()).orElseThrow().isActivo()).isTrue();
    }
}
