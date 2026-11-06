package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Pedido;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    /**
     * Lee el pedido con bloqueo pesimista (SELECT ... FOR UPDATE).
     * Se usa al cambiar de estado: si dos personas cancelan el mismo pedido a la vez,
     * la segunda espera, vuelve a leer el estado ya cancelado y es rechazada
     * (así el stock no se restituye dos veces).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pedido p WHERE p.id = :id")
    Optional<Pedido> buscarPorIdParaActualizar(@Param("id") UUID id);

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.detalles " +
           "WHERE p.fechaPedido >= :inicio AND p.fechaPedido < :fin " +
           "ORDER BY p.fechaPedido DESC")
    List<Pedido> buscarPorRangoDeFechas(@Param("inicio") LocalDateTime inicio,
                                        @Param("fin") LocalDateTime fin);

    @Query("SELECT SUM(p.total) FROM Pedido p " +
           "WHERE p.fechaPedido >= :inicio AND p.fechaPedido < :fin " +
           "AND p.estado <> :estadoExcluido")
    BigDecimal sumarVentasEnRango(@Param("inicio") LocalDateTime inicio,
                                  @Param("fin") LocalDateTime fin,
                                  @Param("estadoExcluido") EstadoPedido estadoExcluido);

    @Query("SELECT COUNT(p) FROM Pedido p " +
           "WHERE p.fechaPedido >= :inicio AND p.fechaPedido < :fin " +
           "AND p.estado <> :estadoExcluido")
    long contarPedidosEnRango(@Param("inicio") LocalDateTime inicio,
                              @Param("fin") LocalDateTime fin,
                              @Param("estadoExcluido") EstadoPedido estadoExcluido);

    @Query("SELECT p.usuario.id FROM Pedido p WHERE p.id = :pedidoId")
    Optional<UUID> buscarIdUsuarioDelPedido(@Param("pedidoId") UUID pedidoId);
}
