package com.sistema.FloreriaBack.config;

import com.sistema.FloreriaBack.security.JwtAuthenticationFilter;
import com.sistema.FloreriaBack.security.JwtUtils;
import org.springframework.security.core.userdetails.UserDetailsService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Configuración de Spring Security:
 * - API sin estado (STATELESS): no hay sesiones, cada petición trae su token JWT.
 * - Endpoints públicos: login, registro y consulta del catálogo.
 * - Endpoints protegidos por rol (ADMINISTRADOR, OPERARIO, CLIENTE).
 * - Reglas de propiedad (un cliente solo ve lo suyo) con @PreAuthorize en los controladores.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String ADMINISTRADOR = "ADMINISTRADOR";
    private static final String OPERARIO = "OPERARIO";

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins}")
    private String[] origenesPermitidos;

    public SecurityConfig(JwtUtils jwtUtils, UserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)          // API REST con JWT: no usa cookies de sesión
            .cors(Customizer.withDefaults())
            .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint((req, res, e) ->
                            escribirError(res, HttpServletResponse.SC_UNAUTHORIZED,
                                    "Debe iniciar sesión (token ausente, inválido o expirado)"))
                    .accessDeniedHandler((req, res, e) ->
                            escribirError(res, HttpServletResponse.SC_FORBIDDEN,
                                    "No tiene permisos para realizar esta acción")))
            .authorizeHttpRequests(auth -> auth
                    // --- Públicos ---
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                    .requestMatchers("/error").permitAll()

                    // --- Catálogo ---
                    // (la regla de stock bajo va antes que la de GET público para que tenga prioridad)
                    .requestMatchers(HttpMethod.GET, "/api/productos/stock-bajo").hasAnyRole(ADMINISTRADOR, OPERARIO)
                    .requestMatchers(HttpMethod.GET,
                            "/api/productos/**", "/api/categorias/**", "/api/detalle-productos/**").permitAll()
                    .requestMatchers("/api/productos/**", "/api/categorias/**", "/api/detalle-productos/**")
                            .hasRole(ADMINISTRADOR)

                    // --- Usuarios: solo el administrador gestiona cuentas ---
                    .requestMatchers("/api/usuarios/**").hasRole(ADMINISTRADOR)

                    // --- Pedidos ---
                    .requestMatchers(HttpMethod.GET, "/api/pedidos/reportes/**").hasRole(ADMINISTRADOR)
                    .requestMatchers(HttpMethod.GET, "/api/pedidos").hasAnyRole(ADMINISTRADOR, OPERARIO)
                    .requestMatchers(HttpMethod.PATCH, "/api/pedidos/*/estado").hasAnyRole(ADMINISTRADOR, OPERARIO)

                    // --- Cotizaciones ---
                    .requestMatchers(HttpMethod.GET, "/api/cotizaciones").hasAnyRole(ADMINISTRADOR, OPERARIO)

                    // --- Todo lo demás requiere estar autenticado (cualquier rol) ---
                    .anyRequest().authenticated())
            .addFilterBefore(new JwtAuthenticationFilter(jwtUtils, userDetailsService),
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** Valida email + contraseña (BCrypt) contra la base de datos durante el login. */
    @Bean
    public AuthenticationManager authenticationManager(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider proveedor = new DaoAuthenticationProvider(userDetailsService);
        proveedor.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(proveedor);
    }

    /** Permite que el front-end (en otro puerto/dominio) llame a la API enviando el token. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(origenesPermitidos).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /** Respuesta de error en JSON con el mismo formato que GlobalExceptionHandler. */
    private void escribirError(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write(String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"mensaje\":\"%s\"}",
                LocalDateTime.now(), status, mensaje));
    }
}
