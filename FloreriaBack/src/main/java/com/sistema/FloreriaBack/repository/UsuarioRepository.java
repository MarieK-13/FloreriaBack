package com.sistema.FloreriaBack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sistema.FloreriaBack.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
    
}
