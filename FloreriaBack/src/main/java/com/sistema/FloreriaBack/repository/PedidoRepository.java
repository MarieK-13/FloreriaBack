package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Pedido;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    List<Pedido> findByUsuarioId(UUID usuarioId);
    List<Pedido> findByEstado(EstadoPedido estado);
}
