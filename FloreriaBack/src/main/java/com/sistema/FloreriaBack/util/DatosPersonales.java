package com.sistema.FloreriaBack.util;

import java.util.Locale;

/** Limpia y normaliza los datos que escribe el usuario antes de guardarlos. */
public final class DatosPersonales {

    private DatosPersonales() {
    }

    /** Emails siempre en minúsculas y sin espacios alrededor. */
    public static String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    /** Celular siempre como +51 seguido de 9 dígitos, sin espacios ni guiones. */
    public static String normalizarTelefono(String telefono) {
        if (telefono == null) {
            return null;
        }
        String digitos = telefono.replaceAll("\\D", "");
        if (digitos.length() == 11 && digitos.startsWith("51")) {
            digitos = digitos.substring(2);
        }
        return "+51" + digitos;
    }

    /** Quita espacios; si queda vacío devuelve null (para campos opcionales). */
    public static String textoOpcional(String texto) {
        if (texto == null) {
            return null;
        }
        String limpio = texto.trim();
        return limpio.isEmpty() ? null : limpio;
    }
}
