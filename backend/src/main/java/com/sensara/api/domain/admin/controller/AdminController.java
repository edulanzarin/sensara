package com.sensara.api.domain.admin.controller;

import com.sensara.api.domain.companion.model.CompanionVerification;
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

    // --- Módulo de Aprovação de Perfis ---

    @GetMapping("/verifications/pending")
    public ResponseEntity<List<CompanionVerification>> getPendingVerifications() {
        var pendings = verificationRepository.findByDocumentStatusOrSelfieStatus(
                VerificationStatus.PENDING, VerificationStatus.PENDING);
        return ResponseEntity.ok(pendings);
    }

    @PutMapping("/verifications/{companionId}/approve")
    @Transactional
    public ResponseEntity<Void> approveCompanion(@PathVariable UUID companionId) {
        var verification = verificationRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification not found"));

        verification.setDocumentStatus(VerificationStatus.APPROVED);
        verification.setSelfieStatus(VerificationStatus.APPROVED);
        verificationRepository.save(verification);

        var companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Companion not found"));

        companion.setVerified(true);
        companionRepository.save(companion);

        return ResponseEntity.noContent().build();
    }

    // --- Módulo de Gestão de Planos ---

    @PostMapping("/plans")
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planRepository.save(plan));
    }

    @GetMapping("/plans")
    public ResponseEntity<List<Plan>> listAllPlans() {
        return ResponseEntity.ok(planRepository.findAll());
    }
}