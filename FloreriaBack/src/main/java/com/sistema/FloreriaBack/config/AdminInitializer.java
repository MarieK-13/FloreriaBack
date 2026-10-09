package com.sistema.FloreriaBack.config;

import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crea el primer ADMINISTRADOR al arrancar la aplicación.
 * Es necesario porque el registro público (/api/auth/register) solo crea CLIENTES
 * y /api/usuarios ahora exige ser ADMINISTRADOR.
 * Solo actúa si se definieron las variables ADMIN_EMAIL y ADMIN_PASSWORD
 * y si ese email todavía no existe.
 */
@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String contrasena;

    public AdminInitializer(UsuarioRepository usuarioRepository,
                            PasswordEncoder passwordEncoder,
                            @Value("${app.admin.email:}") String email,
                            @Value("${app.admin.password:}") String contrasena) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.contrasena = contrasena;
    }

    @Override
    public void run(String... args) {
        if (email == null || email.isBlank() || contrasena == null || contrasena.isBlank()) {
            log.info("ADMIN_EMAIL / ADMIN_PASSWORD no definidos: no se crea administrador inicial");
            return;
        }
        if (usuarioRepository.existsByEmail(email)) {
            return;
        }
        Usuario admin = Usuario.builder()
                .nombre("Administrador")
                .email(email)
                .contrasena(passwordEncoder.encode(contrasena))
                .rol(RolUsuario.ADMINISTRADOR)
                .activo(true)
                .build();
        usuarioRepository.save(admin);
        log.info("Administrador inicial creado: {}", email);
    }
}
