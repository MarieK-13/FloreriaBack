package com.sistema.FloreriaBack.dto.response;

import lombok.*;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class DetalleProductoResponseDTO {

    private UUID id;
    private UUID productoId;
    private String productoNombre;
    private String cuidados;
    private Integer duracionDias;
    private String materiales;
    private String ocasion;
    private String instruccionesEntrega;
}
