package com.sistema.FloreriaBack.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistema.FloreriaBack.dto.request.CategoriaRequestDTO;
import com.sistema.FloreriaBack.dto.request.LoginRequestDTO;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SeguridadIntegracionTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Usuario admin;
    private Usuario cliente;
    private String tokenAdmin;
    private String tokenCliente;

    @BeforeEach
    void setUp() {
        admin = usuarioRepository.findByEmail("admin.seguridad@test.com")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .nombre("Admin Seguridad")
                        .email("admin.seguridad@test.com")
                        .contrasena(passwordEncoder.encode("AdminPass123!"))
                        .rol(RolUsuario.ADMINISTRADOR)
                        .activo(true)
                        .build()));

        cliente = usuarioRepository.findByEmail("cliente.seguridad@test.com")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .nombre("Cliente Seguridad")
                        .email("cliente.seguridad@test.com")
                        .contrasena(passwordEncoder.encode("ClientePass123!"))
                        .rol(RolUsuario.CLIENTE)
                        .activo(true)
                        .build()));

        tokenAdmin = jwtUtils.generarToken(UsuarioPrincipal.desde(admin));
        tokenCliente = jwtUtils.generarToken(UsuarioPrincipal.desde(cliente));
    }

    // 1. LOGIN CORRECTO E INCORRECTO
    @Test
    @DisplayName("POST /api/auth/login - Credenciales válidas debe retornar 200 OK y token JWT")
    void login_CredencialesCorrectas_Retorna200YToken() throws Exception {
        LoginRequestDTO loginDTO = new LoginRequestDTO();
        loginDTO.setEmail("admin.seguridad@test.com");
        loginDTO.setContrasena("AdminPass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email").value("admin.seguridad@test.com"))
                .andExpect(jsonPath("$.rol").value("ADMINISTRADOR"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Contraseña incorrecta debe retornar 401 Unauthorized")
    void login_ContrasenaIncorrecta_Retorna401() throws Exception {
        LoginRequestDTO loginDTO = new LoginRequestDTO();
        loginDTO.setEmail("admin.seguridad@test.com");
        loginDTO.setContrasena("ClaveErroneaTotal123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isUnauthorized());
    }

    // 2. ENDPOINTS PÚBLICOS VS PROTEGIDOS
    @Test
    @DisplayName("GET /api/productos - Endpoint público debe responder 200 OK sin enviar token")
    void endpointPublico_SinToken_Retorna200() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/categorias - Endpoint protegido debe responder 401 Unauthorized sin enviar token")
    void endpointProtegido_SinToken_Retorna401() throws Exception {
        CategoriaRequestDTO dto = new CategoriaRequestDTO();
        dto.setNombre("Nueva Categoria Test");

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    // 3. CONTROL DE ACCESO POR ROLES EN CATEGORÍAS
    @Test
    @DisplayName("POST /api/categorias - Con token de CLIENTE debe retornar 403 Forbidden")
    void crearCategoria_ConTokenCliente_Retorna403() throws Exception {
        CategoriaRequestDTO dto = new CategoriaRequestDTO();
        dto.setNombre("Categoria Cliente Prohibida");

        mockMvc.perform(post("/api/categorias")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/categorias - Con token de ADMINISTRADOR debe retornar 201 Created")
    void crearCategoria_ConTokenAdmin_Retorna201() throws Exception {
        CategoriaRequestDTO dto = new CategoriaRequestDTO();
        dto.setNombre("Exclusivas Orquídeas " + System.currentTimeMillis());
        dto.setDescripcion("Flores de invernadero");

        mockMvc.perform(post("/api/categorias")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nombre").value(dto.getNombre()));
    }

    // 4. ENDPOINTS DE USUARIOS SEGÚN ROL
    @Test
    @DisplayName("GET /api/usuarios - Con token de CLIENTE debe retornar 403 Forbidden")
    void listarUsuarios_ConTokenCliente_Retorna403() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/usuarios - Con token de ADMINISTRADOR debe retornar 200 OK")
    void listarUsuarios_ConTokenAdmin_Retorna200() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk());
    }

    // 5. TOKEN ALTERADO O EXPIRADO
    @Test
    @DisplayName("Petición protegida con token alterado debe retornar 401 Unauthorized")
    void peticion_ConTokenAlterado_Retorna401() throws Exception {
        String tokenAlterado = tokenAdmin.substring(0, tokenAdmin.length() - 5) + "xyz12";

        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenAlterado))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Petición protegida con token expirado debe retornar 401 Unauthorized")
    void peticion_ConTokenExpirado_Retorna401() throws Exception {
        Date pasado = new Date(System.currentTimeMillis() - 60000); // 1 minuto en el pasado
        String tokenExpirado = Jwts.builder()
                .subject("admin.seguridad@test.com")
                .claim("id", admin.getId().toString())
                .claim("rol", "ADMINISTRADOR")
                .issuedAt(new Date(pasado.getTime() - 60000))
                .expiration(pasado)
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenExpirado))
                .andExpect(status().isUnauthorized());
    }

    // 6. CONTROL DE ACCESO PARA OPERARIO EN PEDIDOS Y REPORTES 
    @Test
    @DisplayName("GET /api/pedidos - Con token de OPERARIO debe retornar 200 OK")
    void listarPedidos_ConTokenOperario_Retorna200() throws Exception {
        Usuario operario = usuarioRepository.findByEmail("operario.seguridad@test.com")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .nombre("Operario Test")
                        .email("operario.seguridad@test.com")
                        .contrasena(passwordEncoder.encode("OperarioPass123!"))
                        .rol(RolUsuario.OPERARIO)
                        .activo(true)
                        .build()));
        String tokenOperario = jwtUtils.generarToken(UsuarioPrincipal.desde(operario));

        mockMvc.perform(get("/api/pedidos")
                        .header("Authorization", "Bearer " + tokenOperario))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pedidos/reportes/ventas - Con token de OPERARIO debe retornar 403 Forbidden")
    void verReportesVentas_ConTokenOperario_Retorna403() throws Exception {
        Usuario operario = usuarioRepository.findByEmail("operario.seguridad@test.com")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .nombre("Operario Test")
                        .email("operario.seguridad@test.com")
                        .contrasena(passwordEncoder.encode("OperarioPass123!"))
                        .rol(RolUsuario.OPERARIO)
                        .activo(true)
                        .build()));
        String tokenOperario = jwtUtils.generarToken(UsuarioPrincipal.desde(operario));

        mockMvc.perform(get("/api/pedidos/reportes/ventas")
                        .param("inicio", "2026-10-01")
                        .param("fin", "2026-10-31")
                        .header("Authorization", "Bearer " + tokenOperario))
                .andExpect(status().isForbidden());
    }

    // 7. REGLA DE PROPIEDAD DE RECURSO: CLIENTE A CONSULTA AL CLIENTE B (TAREA 3.3)
    @Test
    @DisplayName("GET /api/pedidos/usuario/{id} - Un CLIENTE A no puede consultar los pedidos de un CLIENTE B (403)")
    void clienteA_ConsultaPedidosClienteB_Retorna403() throws Exception {
        UUID otroUsuarioId = UUID.randomUUID(); 

        mockMvc.perform(get("/api/pedidos/usuario/{usuarioId}", otroUsuarioId)
                        .header("Authorization", "Bearer " + tokenCliente)) 
                .andExpect(status().isForbidden());
    }

    // 8. USUARIO DESACTIVADO 
    @DisplayName("Filtro JWT: Un usuario que pasó a estar inactivo es expulsado con 401 Unauthorized")
    void peticion_ConTokenDeUsuarioQuePasoAInactivo_Retorna401() throws Exception {
        Usuario mutante = usuarioRepository.save(Usuario.builder()
                .nombre("Usuario Mutante")
                .email("mutante.seguridad@test.com")
                .contrasena(passwordEncoder.encode("Mutante123!"))
                .rol(RolUsuario.CLIENTE)
                .activo(true) 
                .build());
        
        String tokenMutante = jwtUtils.generarToken(UsuarioPrincipal.desde(mutante));

        mutante.setActivo(false);
        usuarioRepository.save(mutante);

        mockMvc.perform(get("/api/categorias")
                        .header("Authorization", "Bearer " + tokenMutante))
                .andExpect(status().isUnauthorized()); 
    }
}

