package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.request.CambioContrasenaRequestDTO;
import com.sistema.FloreriaBack.dto.request.CambioEmailRequestDTO;
import com.sistema.FloreriaBack.dto.request.EliminarCuentaRequestDTO;
import com.sistema.FloreriaBack.dto.request.PerfilUpdateRequestDTO;
import com.sistema.FloreriaBack.dto.response.AuthResponseDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;

import java.util.UUID;

/**
 * CRUD de la cuenta propia (la del usuario que inició sesión).
 * El "Create" es el registro: AuthService.registrar.
 */
public interface CuentaService {

    /** R: datos de "Mi cuenta". */
    UsuarioResponseDTO obtener(UUID idUsuario);

    /** U: nombres, apellidos, teléfono, distrito y dirección. */
    UsuarioResponseDTO actualizarPerfil(UUID idUsuario, PerfilUpdateRequestDTO dto);

    /** U: cambia la contraseña verificando la actual. */
    void cambiarContrasena(UUID idUsuario, CambioContrasenaRequestDTO dto);

    /** U: cambia el correo. Devuelve un token nuevo porque el token guarda el email. */
    AuthResponseDTO cambiarEmail(UUID idUsuario, CambioEmailRequestDTO dto);

    /** D: elimina la cuenta (borra los datos personales y la desactiva; los pedidos se conservan). */
    void eliminarCuenta(UUID idUsuario, EliminarCuentaRequestDTO dto);
}
