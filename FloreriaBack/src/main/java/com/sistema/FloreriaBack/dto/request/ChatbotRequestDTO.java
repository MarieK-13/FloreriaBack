package com.sistema.FloreriaBack.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotRequestDTO {

    private UUID usuarioId; 

    @NotBlank(message = "El mensaje del cliente no puede estar vacío")
    private String mensajeCliente; 

    private BigDecimal presupuesto; 
}