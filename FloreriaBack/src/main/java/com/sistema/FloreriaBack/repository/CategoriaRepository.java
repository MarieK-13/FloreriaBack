package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoriaRepository  extends JpaRepository<Categoria, UUID> {
    boolean existsByNombre(String nombre);
}
