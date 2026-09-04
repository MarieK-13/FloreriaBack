package com.sistema.FloreriaBack.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor

@EqualsAndHashCode(of = "id")
@ToString(exclude = "categoria")

@Entity
@Builder 
@Table(name = "producto")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @Column(nullable = false)
    private Double precio;

    @Column(nullable = false)
    private Integer stock;

    private Boolean disponible;

    private String color;

    private String tamano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
}
