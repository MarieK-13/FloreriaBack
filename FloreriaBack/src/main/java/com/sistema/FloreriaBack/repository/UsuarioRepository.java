package com.sistema.FloreriaBack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sistema.FloreriaBack.model.Usuario;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID>{
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
}
