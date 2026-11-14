package com.sistema.FloreriaBack.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ComponenteProducto {

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private String descripcion;
}