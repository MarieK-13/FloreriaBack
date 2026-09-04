package com.sistema.FloreriaBack.mapper;

import com.sistema.FloreriaBack.dto.request.UsuarioRequestDTO;
import com.sistema.FloreriaBack.dto.response.UsuarioResponseDTO;
import com.sistema.FloreriaBack.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toEntity(UsuarioRequestDTO dto) {
        return Usuario.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail())
                .contrasena(dto.getContrasena())
                .rol(dto.getRol())
                .activo(true) // todo usuario nuevo empieza activo
                .build();
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
