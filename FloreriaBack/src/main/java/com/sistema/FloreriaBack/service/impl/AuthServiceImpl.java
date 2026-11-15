package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.LoginRequestDTO;
import com.sistema.FloreriaBack.dto.request.RegistroRequestDTO;
import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.response.AuthResponseDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
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

import java.time.LocalDateTime;

import static com.sistema.FloreriaBack.util.DatosPersonales.normalizarEmail;
import static com.sistema.FloreriaBack.util.DatosPersonales.normalizarTelefono;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserDetailsService userDetailsService,
                           UsuarioService usuarioService,
                           UsuarioRepository usuarioRepository,
                           JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Valida email y contraseña. Si son incorrectos, Spring lanza BadCredentialsException
     * (respuesta 401); si el usuario está inactivo, DisabledException (respuesta 403).
     */
    @Override
    public AuthResponseDTO login(LoginRequestDTO dto) {
        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizarEmail(dto.getEmail()), dto.getContrasena()));
        UsuarioPrincipal usuario = (UsuarioPrincipal) autenticacion.getPrincipal();
        return construirRespuesta(usuario);
    }

    /** Registro público: siempre crea un CLIENTE y devuelve su token para que quede logueado. */
    @Override
    @Transactional
    public AuthResponseDTO registrar(RegistroRequestDTO dto) {
        String email = normalizarEmail(dto.getEmail());

        UsuarioRequestDTO nuevo = new UsuarioRequestDTO();
        nuevo.setNombre(dto.getNombre().trim());
        nuevo.setApellidos(dto.getApellidos().trim());
        nuevo.setTelefono(normalizarTelefono(dto.getTelefono()));
        nuevo.setEmail(email);
        nuevo.setContrasena(dto.getContrasena());
        nuevo.setRol(RolUsuario.CLIENTE);

        // valida email repetido y cifra la contraseña con BCrypt
        UsuarioResponseDTO creado = usuarioService.registrar(nuevo);

        // Deja constancia de cuándo aceptó los términos (el DTO ya exige aceptaTerminos = true)
        usuarioRepository.findById(creado.getId())
                .ifPresent(usuario -> usuario.setTerminosAceptadosEn(LocalDateTime.now()));

        return generarSesion(email);
    }

    @Override
    public AuthResponseDTO generarSesion(String email) {
        UsuarioPrincipal usuario = (UsuarioPrincipal) userDetailsService.loadUserByUsername(email);
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
