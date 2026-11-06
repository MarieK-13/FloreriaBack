package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.request.UsuarioUpdateRequestDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.util.EmailUtils;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toEntity(UsuarioRequestDTO dto) {
        return Usuario.builder()
                .nombre(dto.getNombre())
                .email(EmailUtils.normalizar(dto.getEmail()))
                .contrasena(dto.getContrasena())
                .rol(dto.getRol())
                .activo(true)
                .build();
    }

    public void actualizarEntidad(Usuario usuario, UsuarioUpdateRequestDTO dto) {
        usuario.setNombre(dto.getNombre());
        usuario.setEmail(EmailUtils.normalizar(dto.getEmail()));
        usuario.setRol(dto.getRol());
    }

    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(), 
                usuario.getNombre(), 
                usuario.getEmail(),
                usuario.getRol(), 
                usuario.isActivo()
        );
    }
}
