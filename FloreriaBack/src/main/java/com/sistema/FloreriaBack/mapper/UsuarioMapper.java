package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.request.UsuarioUpdateRequestDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toEntity(UsuarioRequestDTO dto) {
        return Usuario.builder()
                .nombre(dto.getNombre())
                .apellidos(dto.getApellidos())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .contrasena(dto.getContrasena())
                .rol(dto.getRol())
                .activo(true) 
                .build();
    }

    /** Copia nombre, email y rol a un usuario existente. La contraseña la maneja el servicio (se cifra). */
    public void actualizarEntidad(Usuario usuario, UsuarioUpdateRequestDTO dto) {
        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        usuario.setRol(dto.getRol());
    }

    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellidos(),
                usuario.getEmail(),
                usuario.getTelefono(),
                usuario.getDistrito(),
                usuario.getDireccion(),
                usuario.getRol(),
                usuario.isActivo()
        );
    }
}
