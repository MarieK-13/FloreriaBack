package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, UUID> {
}
