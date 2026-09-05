package com.sistema.FloreriaBack.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "producto")
@Entity
@Builder
@Table(name = "detalle_producto")
public class DetalleProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false, unique = true)
    private Producto producto;

    @Column(columnDefinition = "TEXT")
    private String cuidados;

    private Integer duracionDias;

    private String materiales;

    private String ocasion;

    @Column(columnDefinition = "TEXT")
    private String instruccionesEntrega;
}
