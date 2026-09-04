
package com.sistema.FloreriaBack.model;
import com.sistema.FloreriaBack.model.enums.RolUsuario;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "usuarios")

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

@EqualsAndHashCode(of = "id")
@ToString(exclude = "contrasena")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String contrasena;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rol;

    @Column(nullable = false)
    private boolean activo;
}