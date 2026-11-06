package com.sistema.FloreriaBack.util;

import java.util.Locale;

/**
 * El correo"Ana@Correo.com " y "ana@correo.com"
 * se trate siempre como el mismo usuario 
 */

public final class EmailUtils {

    private EmailUtils() {
    }

    public static String normalizar(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
