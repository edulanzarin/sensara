package com.sensara.api.domain.plan.controller;

import com.sensara.api.domain.plan.model.Subscription;
import com.sensara.api.domain.plan.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/companions/{companionId}/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;

    @GetMapping
    public ResponseEntity<SubscriptionResponse> getActive(@PathVariable UUID companionId) {
        var sub = subscriptionRepository.findByCompanionIdAndActiveTrue(companionId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active subscription"));

        return ResponseEntity.ok(new SubscriptionResponse(
                sub.getPlan().getName(),
                sub.getEndsAt().toString()));
    }

    public record SubscriptionResponse(String name, String endsAt) {
    }
}