package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.LoginRequestDTO;
import com.sistema.FloreriaBack.dto.request.RegistroRequestDTO;
import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.response.AuthResponseDTO;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.security.JwtUtils;
import com.sistema.FloreriaBack.security.UsuarioPrincipal;
import com.sistema.FloreriaBack.service.AuthService;
import com.sistema.FloreriaBack.service.UsuarioService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UsuarioService usuarioService;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserDetailsService userDetailsService,
                           UsuarioService usuarioService,
                           JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.usuarioService = usuarioService;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Valida email y contraseña. Si son incorrectos, Spring lanza BadCredentialsException
     * (respuesta 401); si el usuario está inactivo, DisabledException (respuesta 403).
     */
    @Override
    public AuthResponseDTO login(LoginRequestDTO dto) {
        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getContrasena()));
        UsuarioPrincipal usuario = (UsuarioPrincipal) autenticacion.getPrincipal();
        return construirRespuesta(usuario);
    }

    /** Registro público: siempre crea un CLIENTE y devuelve su token para que quede logueado. */
    @Override
    @Transactional
    public AuthResponseDTO registrar(RegistroRequestDTO dto) {
        UsuarioRequestDTO nuevo = new UsuarioRequestDTO();
        nuevo.setNombre(dto.getNombre());
        nuevo.setEmail(dto.getEmail());
        nuevo.setContrasena(dto.getContrasena());
        nuevo.setRol(RolUsuario.CLIENTE);

        usuarioService.registrar(nuevo); // valida email repetido y cifra la contraseña con BCrypt

        UsuarioPrincipal usuario = (UsuarioPrincipal) userDetailsService.loadUserByUsername(dto.getEmail());
        return construirRespuesta(usuario);
    }

    private AuthResponseDTO construirRespuesta(UsuarioPrincipal usuario) {
        return new AuthResponseDTO(
                jwtUtils.generarToken(usuario),
                "Bearer",
                jwtUtils.getExpiracionMs(),
                usuario.getId(),
                usuario.getNombre(),
                usuario.getUsername(),
                usuario.getRol()
        );
    }
}
