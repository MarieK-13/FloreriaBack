package com.sistema.FloreriaBack.security;

import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Representa al usuario autenticado dentro de Spring Security.
 * Guarda el ID del usuario para poder verificar que un CLIENTE solo acceda a sus propios datos.
 */
public class UsuarioPrincipal implements UserDetails {

    private final UUID id;
    private final String nombre;
    private final String email;
    private final String contrasena;
    private final RolUsuario rol;
    private final boolean activo;

    public UsuarioPrincipal(UUID id, String nombre, String email, String contrasena,
                            RolUsuario rol, boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.contrasena = contrasena;
        this.rol = rol;
        this.activo = activo;
    }

    public static UsuarioPrincipal desde(Usuario usuario) {
        return new UsuarioPrincipal(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getContrasena(),
                usuario.getRol(),
                usuario.isActivo()
        );
    }

    public UUID getId() { return id; }

    public String getNombre() { return nombre; }

    public RolUsuario getRol() { return rol; }

    /** Spring Security espera el prefijo "ROLE_" para usar hasRole('ADMINISTRADOR'). */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getPassword() { return contrasena; }

    /** El "username" del sistema es el email. */
    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    /** Un usuario con activo = false no puede iniciar sesión ni usar su token. */
    @Override
    public boolean isEnabled() { return activo; }
}
