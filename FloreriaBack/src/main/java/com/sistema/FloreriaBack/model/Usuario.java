
package com.sistema.FloreriaBack.model;
import com.sistema.FloreriaBack.model.enums.RolUsuario;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
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

    /** Nombres de la persona (en el registro se piden por separado de los apellidos). */
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Opcional en la BD para no romper usuarios creados antes; el registro público lo exige. */
    @Column(length = 100)
    private String apellidos;

    /** Celular con prefijo de Perú, ej. +51987654321. Opcional en la BD, exigido en el registro. */
    @Column(length = 20)
    private String telefono;

    /** Distrito o ciudad de entrega habitual (se completa en "Mi cuenta"). */
    @Column(length = 100)
    private String distrito;

    /** Dirección de entrega habitual (se completa en "Mi cuenta"). */
    @Column(length = 200)
    private String direccion;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String contrasena;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rol;

    @Column(nullable = false)
    private boolean activo;

    /** Cuándo aceptó los términos y la política de privacidad al registrarse. */
    @Column(name = "terminos_aceptados_en")
    private LocalDateTime terminosAceptadosEn;
}