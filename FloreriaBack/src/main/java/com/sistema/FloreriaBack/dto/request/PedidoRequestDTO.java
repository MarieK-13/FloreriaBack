package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoRequestDTO {

    @NotNull(message = "El ID del usuario es obligatorio")
    private UUID usuarioId;

    @NotBlank(message = "La dirección de entrega es obligatoria")
    @Size(max = 250, message = "La dirección de entrega no debe superar 250 caracteres")
    private String direccionEntrega;

    @Size(max = 500, message = "Las instrucciones de entrega no deben superar 500 caracteres")
    private String instruccionesEntrega;

    @NotEmpty(message = "El pedido debe incluir al menos un producto")
    @Valid
    private List<DetallePedidoRequestDTO> detalles;
}
