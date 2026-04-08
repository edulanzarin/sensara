package com.sensara.api.domain.admin.controller;

import com.sensara.api.domain.companion.model.VerificationStatus;
import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.companion.repository.VerificationRepository;
import com.sensara.api.domain.plan.model.Plan;
import com.sensara.api.domain.plan.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final VerificationRepository verificationRepository;
    private final CompanionRepository companionRepository;
    private final PlanRepository planRepository;

    public record CompanionInfo(UUID id, String nickname, String city, String state) {
    }

    public record VerificationDto(
            CompanionInfo companion,
            String selfieStatus,
            String documentStatus,
            String selfieUrl,
            String documentUrl,
            Boolean phoneVerified,
            Integer reliabilityScore) {
    }

    @GetMapping("/verifications/pending")
    public ResponseEntity<List<VerificationDto>> getPendingVerifications() {
        var pendings = verificationRepository.findByDocumentStatusOrSelfieStatus(
                VerificationStatus.PENDING, VerificationStatus.PENDING);

        var dtos = pendings.stream().map(v -> {
            var c = v.getCompanion();
            return new VerificationDto(
                    new CompanionInfo(c.getId(), c.getNickname(), c.getCity(), c.getState()),
                    v.getSelfieStatus().name(),
                    v.getDocumentStatus().name(),
                    v.getSelfieUrl(),
                    v.getDocumentUrl(),
                    v.getPhoneVerified(),
                    v.getReliabilityScore());
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/verifications/{companionId}/selfie/{status}")
    @Transactional
    public ResponseEntity<Void> reviewSelfie(
            @PathVariable UUID companionId,
            @PathVariable VerificationStatus status) {

        if (status != VerificationStatus.APPROVED && status != VerificationStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido.");
        }

        var verification = verificationRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification not found"));

        verification.setSelfieStatus(status);
        verificationRepository.save(verification);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/verifications/{companionId}/document/{status}")
    @Transactional
    public ResponseEntity<Void> reviewDocument(
            @PathVariable UUID companionId,
            @PathVariable VerificationStatus status) {

        if (status != VerificationStatus.APPROVED && status != VerificationStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido.");
        }

        var verification = verificationRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification not found"));

        verification.setDocumentStatus(status);
        verificationRepository.save(verification);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/plans")
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planRepository.save(plan));
    }

    @GetMapping("/plans")
    public ResponseEntity<List<Plan>> listAllPlans() {
        return ResponseEntity.ok(planRepository.findAll());
    }
}