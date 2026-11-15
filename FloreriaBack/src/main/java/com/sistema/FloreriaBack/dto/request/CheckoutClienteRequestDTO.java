package com.sistema.FloreriaBack.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutClienteRequestDTO {

    @NotBlank(message = "La dirección de entrega es obligatoria")
    private String direccionEntrega;

    private String instruccionesEntrega;

    @NotEmpty(message = "El pedido debe incluir al menos un producto")
    @Valid
    private List<DetallePedidoRequestDTO> detalles;
}