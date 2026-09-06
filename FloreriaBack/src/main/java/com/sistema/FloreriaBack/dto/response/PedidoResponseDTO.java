package com.sistema.FloreriaBack.dto.response;

import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponseDTO {
    private UUID id;
    private LocalDateTime fechaPedido;
    private BigDecimal total;
    private String direccionEntrega;
    private String instruccionesEntrega;
    private EstadoPedido estado;
    private UUID usuarioId;
    private String usuarioNombre;
    private List<DetallePedidoResponseDTO> detalles;
}
