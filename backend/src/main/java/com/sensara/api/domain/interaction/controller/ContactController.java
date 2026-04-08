package com.sensara.api.domain.interaction.controller;

import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.interaction.model.ContactClick;
import com.sensara.api.domain.interaction.repository.ContactClickRepository;
import com.sensara.api.domain.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/companions/{companionId}/contact")
@RequiredArgsConstructor
public class ContactController {

    private final CompanionRepository companionRepository;
    private final ContactClickRepository contactClickRepository;

    public record WhatsappLinkDto(String url) {
    }

    @PostMapping("/whatsapp")
    public ResponseEntity<WhatsappLinkDto> registerClickAndGetLink(
            @PathVariable UUID companionId,
            @AuthenticationPrincipal User client) {

        var companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Companion not found"));

        if (companion.getWhatsapp() == null || companion.getWhatsapp().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Companion does not have a registered whatsapp");
        }

        var click = ContactClick.builder()
                .companion(companion)
                .client(client) // será null se a rota for acessada por visitante deslogado
                .build();

        contactClickRepository.save(click);

        String message = "Olá " + companion.getNickname()
                + ", vi seu perfil no Sensara e gostaria de mais informações.";
        String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);

        // formata apenas os números para a api do whatsapp não quebrar
        String cleanPhone = companion.getWhatsapp().replaceAll("[^0-9]", "");

        // se o numero não tiver o código do brasil (55), você pode adicionar aqui
        if (!cleanPhone.startsWith("55")) {
            cleanPhone = "55" + cleanPhone;
        }

        String whatsappUrl = "https://wa.me/" + cleanPhone + "?text=" + encodedMessage;

        return ResponseEntity.ok(new WhatsappLinkDto(whatsappUrl));
    }
}