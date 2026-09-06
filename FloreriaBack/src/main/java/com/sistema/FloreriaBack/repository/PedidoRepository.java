package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Pedido;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    @Override
    @EntityGraph(attributePaths = {"detalles", "usuario"})
    Optional<Pedido> findById(UUID id);

    @Override
    @EntityGraph(attributePaths = {"detalles", "usuario"})
    List<Pedido> findAll();

    @EntityGraph(attributePaths = {"detalles", "usuario"})
    List<Pedido> findByUsuarioId(UUID usuarioId);

    @EntityGraph(attributePaths = {"detalles", "usuario"})
    List<Pedido> findByEstado(EstadoPedido estado);
}
