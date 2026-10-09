package com.sistema.FloreriaBack.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Genera y valida los tokens JWT firmados con HMAC-SHA256.
 * La clave secreta y la duración del token se leen de application.properties
 * (que a su vez las toma de variables de entorno).
 */
@Component
public class JwtUtils {

    private static final int LONGITUD_MINIMA_CLAVE = 32; // 256 bits, requerido por HS256

    private final SecretKey clave;
    private final long expiracionMs;

    public JwtUtils(@Value("${jwt.secret}") String secreto,
                    @Value("${jwt.expiration-ms:86400000}") long expiracionMs) {
        if (secreto == null || secreto.getBytes(StandardCharsets.UTF_8).length < LONGITUD_MINIMA_CLAVE) {
            throw new IllegalStateException(
                    "jwt.secret (variable JWT_SECRET) debe tener al menos " + LONGITUD_MINIMA_CLAVE + " caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.expiracionMs = expiracionMs;
    }

    /** Crea un token con el email como "subject" y el ID y rol como datos adicionales. */
    public String generarToken(UsuarioPrincipal usuario) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(usuario.getUsername())
                .claim("id", usuario.getId().toString())
                .claim("rol", usuario.getRol().name())
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    /** Devuelve el email guardado en el token. Lanza JwtException si el token es inválido o expiró. */
    public String obtenerEmail(String token) {
        return leerClaims(token).getSubject();
    }

    /** El token es válido si la firma es correcta, no expiró y pertenece al usuario indicado. */
    public boolean esTokenValido(String token, UserDetails usuario) {
        try {
            Claims claims = leerClaims(token);
            return usuario.getUsername().equals(claims.getSubject())
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public long getExpiracionMs() {
        return expiracionMs;
    }

    private Claims leerClaims(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
