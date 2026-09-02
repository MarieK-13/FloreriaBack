
package com.sistema.FloreriaBack.model;
import com.sistema.FloreriaBack.model.enums.RolUsuario;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

@EqualsAndHashCode(of = "id")
@ToString
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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