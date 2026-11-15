package com.sistema.FloreriaBack.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistema.FloreriaBack.model.FechaImportante;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FechaImportanteRepository extends JpaRepository<FechaImportante, UUID> {

    List<FechaImportante> findByUsuarioIdOrderByFechaAsc(UUID usuarioId);

    Optional<FechaImportante> findByIdAndUsuarioId(UUID id, UUID usuarioId);
}