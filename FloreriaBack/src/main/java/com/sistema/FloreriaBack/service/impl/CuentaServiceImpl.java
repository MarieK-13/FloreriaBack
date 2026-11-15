package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.request.CambioContrasenaRequestDTO;
import com.sistema.FloreriaBack.dto.request.CambioEmailRequestDTO;
import com.sistema.FloreriaBack.dto.request.EliminarCuentaRequestDTO;
import com.sistema.FloreriaBack.dto.request.PerfilUpdateRequestDTO;
import com.sistema.FloreriaBack.dto.response.AuthResponseDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.exception.ResourceNotFoundException;
import com.sistema.FloreriaBack.mapper.UsuarioMapper;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.AuthService;
import com.sistema.FloreriaBack.service.CuentaService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static com.sistema.FloreriaBack.util.DatosPersonales.normalizarEmail;
import static com.sistema.FloreriaBack.util.DatosPersonales.normalizarTelefono;
import static com.sistema.FloreriaBack.util.DatosPersonales.textoOpcional;

@Service
public class CuentaServiceImpl implements CuentaService {

    static final String CONTRASENA_INCORRECTA = "La contraseña actual no es correcta";

    private final UsuarioRepository repository;
    private final UsuarioMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public CuentaServiceImpl(UsuarioRepository repository,
                             UsuarioMapper mapper,
                             PasswordEncoder passwordEncoder,
                             AuthService authService) {
        this.repository = repository;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtener(UUID idUsuario) {
        return mapper.toResponseDTO(buscar(idUsuario));
    }

    @Override
    @Transactional
    public UsuarioResponseDTO actualizarPerfil(UUID idUsuario, PerfilUpdateRequestDTO dto) {
        Usuario usuario = buscar(idUsuario);
        usuario.setNombre(dto.getNombre().trim());
        usuario.setApellidos(dto.getApellidos().trim());
        usuario.setTelefono(normalizarTelefono(dto.getTelefono()));
        usuario.setDistrito(textoOpcional(dto.getDistrito()));
        usuario.setDireccion(textoOpcional(dto.getDireccion()));
        return mapper.toResponseDTO(repository.save(usuario));
    }

    @Override
    @Transactional
    public void cambiarContrasena(UUID idUsuario, CambioContrasenaRequestDTO dto) {
        Usuario usuario = buscar(idUsuario);
        verificarContrasena(usuario, dto.getContrasenaActual());

        if (!dto.getNuevaContrasena().equals(dto.getConfirmacion())) {
            throw new BusinessRuleException("La confirmación no coincide con la nueva contraseña");
        }
        if (passwordEncoder.matches(dto.getNuevaContrasena(), usuario.getContrasena())) {
            throw new BusinessRuleException("La nueva contraseña debe ser distinta a la actual");
        }

        usuario.setContrasena(passwordEncoder.encode(dto.getNuevaContrasena()));
        repository.save(usuario);
    }

    @Override
    @Transactional
    public AuthResponseDTO cambiarEmail(UUID idUsuario, CambioEmailRequestDTO dto) {
        Usuario usuario = buscar(idUsuario);
        verificarContrasena(usuario, dto.getContrasenaActual());

        String nuevoEmail = normalizarEmail(dto.getNuevoEmail());
        if (nuevoEmail.equalsIgnoreCase(usuario.getEmail())) {
            throw new BusinessRuleException("El nuevo correo es igual al actual");
        }
        if (repository.existsByEmailIgnoreCaseAndIdNot(nuevoEmail, idUsuario)) {
            throw new BusinessRuleException("Ya existe un usuario con ese email");
        }

        usuario.setEmail(nuevoEmail);
        repository.saveAndFlush(usuario);

        // El token anterior tenía el correo viejo y deja de servir: se entrega uno nuevo.
        return authService.generarSesion(nuevoEmail);
    }

    /**
     * No se borra la fila porque los pedidos y cotizaciones apuntan al usuario.
     * En su lugar se borran los datos personales, se libera el correo (para que pueda
     * registrarse de nuevo si quiere) y la cuenta queda desactivada.
     */
    @Override
    @Transactional
    public void eliminarCuenta(UUID idUsuario, EliminarCuentaRequestDTO dto) {
        Usuario usuario = buscar(idUsuario);
        verificarContrasena(usuario, dto.getContrasena());

        if (usuario.getRol() == RolUsuario.ADMINISTRADOR) {
            throw new BusinessRuleException(
                    "Un administrador no puede eliminar su propia cuenta; pídale a otro administrador que lo haga");
        }

        usuario.setNombre("Cuenta eliminada");
        usuario.setApellidos(null);
        usuario.setTelefono(null);
        usuario.setDistrito(null);
        usuario.setDireccion(null);
        usuario.setEmail("eliminado-" + usuario.getId() + "@floriasmart.invalid");
        usuario.setContrasena(passwordEncoder.encode(UUID.randomUUID().toString()));
        usuario.setActivo(false);
        repository.save(usuario);
    }

    private Usuario buscar(UUID idUsuario) {
        return repository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + idUsuario));
    }

    /** Responde 400 (no 401) para que el front no cierre la sesión por escribir mal la contraseña. */
    private void verificarContrasena(Usuario usuario, String contrasena) {
        if (contrasena == null || !passwordEncoder.matches(contrasena, usuario.getContrasena())) {
            throw new BusinessRuleException(CONTRASENA_INCORRECTA);
        }
    }
}
