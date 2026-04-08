package com.sensara.api.domain.companion.controller;

import com.sensara.api.domain.companion.dto.DashboardDto;
import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.interaction.repository.ContactClickRepository;
import com.sensara.api.domain.plan.service.SubscriptionService;
import com.sensara.api.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/companions/{companionId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final CompanionRepository companionRepository;
    private final ContactClickRepository contactClickRepository;
    private final ReviewRepository reviewRepository;
    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<DashboardDto> getMetrics(@PathVariable UUID companionId) {

        var companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Companion not found"));

        long totalClicks = contactClickRepository.countByCompanionId(companionId);
        double avgRating = reviewRepository.getAverageRating(companionId);

        String planName = "Gratuito";
        try {
            var plan = subscriptionService.getActivePlan(companionId);
            planName = plan.getName();
        } catch (ResponseStatusException e) {
            // Ignora se não tiver plano ativo, mantém como Gratuito
        }

        var dto = new DashboardDto(
                companion.getProfileViews(),
                totalClicks,
                avgRating,
                planName);

        return ResponseEntity.ok(dto);
    }
}