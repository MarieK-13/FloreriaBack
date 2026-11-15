package com.sistema.FloreriaBack.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@EqualsAndHashCode(of = "id")
@ToString
@Builder
@Entity
@Table(name = "fechas_importantes")
public class FechaImportante {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String ocasion;

    @Column(nullable = false, length = 80)
    private String persona;

    @Column(nullable = false)
    private LocalDate fecha;

    @Builder.Default
    @Column(name = "dias_anticipacion", nullable = false)
    private Integer diasAnticipacion = 7;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.diasAnticipacion == null) {
            this.diasAnticipacion = 7;
        }
    }

}