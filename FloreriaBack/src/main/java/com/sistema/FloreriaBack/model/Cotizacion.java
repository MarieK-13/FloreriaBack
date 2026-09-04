
package com.sistema.FloreriaBack.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import com.sistema.FloreriaBack.model.enums.EstadoCotizacion;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor

@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = "items") 

@Entity
@Table(name = "cotizaciones")
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private BigDecimal total;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = true) 
    private Usuario usuario;

    @Column(length = 500)
    private String mensajeCliente;

    private BigDecimal presupuesto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoCotizacion estado;
    
    @Builder.Default
    @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCotizacion> items = new ArrayList<>();

    public void addItem(ItemCotizacion item) {
        items.add(item);
        item.setCotizacion(this);
    }
}