package com.sistema.FloreriaBack.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = { "categoria", "ocasiones" })
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

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer stock;

    @Builder.Default
    private Boolean disponible = true;

    private String color;

    private String tamano;

    private String imagenUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "producto_ocasiones", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "ocasion")
    private Set<String> ocasiones = new HashSet<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "producto_componentes", joinColumns = @JoinColumn(name = "producto_id"))
    @OrderColumn(name = "orden")
    private List<ComponenteProducto> componentes = new ArrayList<>();

    private LocalDate fechaValidez;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;
}