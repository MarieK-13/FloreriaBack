// ChatbotController.java
package com.sistema.FloreriaBack.controller;

import com.sistema.FloreriaBack.dto.request.ChatbotRequestDTO;
import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import com.sistema.FloreriaBack.service.CotizacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final CotizacionService service;

    public ChatbotController(CotizacionService service) {
        this.service = service;
    }

    // Endpoint: POST /api/chatbot/cotizar
    @PostMapping("/cotizar")
    public ResponseEntity<CotizacionResponseDTO> cotizar(@RequestBody ChatbotRequestDTO request) {
        CotizacionResponseDTO response = service.generarCotizacion(request.getMensajeUsuario());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}