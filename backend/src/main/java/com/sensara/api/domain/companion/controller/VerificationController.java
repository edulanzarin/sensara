package com.sensara.api.domain.companion.controller;

import com.sensara.api.domain.companion.model.CompanionVerification;
import com.sensara.api.domain.companion.model.VerificationStatus;
import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.companion.repository.VerificationRepository;
import com.sensara.api.domain.media.service.StorageService;
import com.sensara.api.domain.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/companions/me/verification")
@RequiredArgsConstructor
public class VerificationController {

        private final VerificationRepository verificationRepository;
        private final CompanionRepository companionRepository;
        private final StorageService storageService;

        @GetMapping
        public ResponseEntity<VerificationResponse> getMyVerification(
                        @AuthenticationPrincipal User loggedUser) {

                var verification = verificationRepository.findById(loggedUser.getId())
                                .orElseGet(() -> createEmptyVerification(loggedUser.getId()));

                return ResponseEntity.ok(toResponse(verification));
        }

        @PostMapping(value = "/selfie", consumes = "multipart/form-data")
        public ResponseEntity<VerificationResponse> submitSelfie(
                        @RequestParam("file") MultipartFile file,
                        @AuthenticationPrincipal User loggedUser) {

                var verification = verificationRepository.findById(loggedUser.getId())
                                .orElseGet(() -> createEmptyVerification(loggedUser.getId()));

                if (verification.getSelfieStatus() == VerificationStatus.APPROVED) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selfie já aprovada.");
                }

                String url = storageService.upload(file);
                verification.setSelfieUrl(url);
                verification.setSelfieStatus(VerificationStatus.PENDING);
                verificationRepository.save(verification);

                return ResponseEntity.ok(toResponse(verification));
        }

        @PostMapping(value = "/document", consumes = "multipart/form-data")
        public ResponseEntity<VerificationResponse> submitDocument(
                        @RequestParam("file") MultipartFile file,
                        @AuthenticationPrincipal User loggedUser) {

                var verification = verificationRepository.findById(loggedUser.getId())
                                .orElseGet(() -> createEmptyVerification(loggedUser.getId()));

                if (verification.getDocumentStatus() == VerificationStatus.APPROVED) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Documento já aprovado.");
                }

                String url = storageService.upload(file);
                verification.setDocumentUrl(url);
                verification.setDocumentStatus(VerificationStatus.PENDING);
                verificationRepository.save(verification);

                return ResponseEntity.ok(toResponse(verification));
        }

        private CompanionVerification createEmptyVerification(UUID companionId) {
                var companion = companionRepository.findById(companionId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Companion not found"));

                var verification = CompanionVerification.builder()
                                .companion(companion)
                                .build();

                return verificationRepository.save(verification);
        }

        private VerificationResponse toResponse(CompanionVerification v) {
                return new VerificationResponse(
                                v.getSelfieStatus().name(),
                                v.getDocumentStatus().name(),
                                v.getPhoneVerified(),
                                v.getReliabilityScore());
        }

        public record VerificationResponse(
                        String selfieStatus,
                        String documentStatus,
                        Boolean phoneVerified,
                        Integer reliabilityScore) {
        }
}