package com.sensara.api.domain.companion.repository;

import com.sensara.api.domain.companion.model.CompanionVerification;
import com.sensara.api.domain.companion.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface VerificationRepository extends JpaRepository<CompanionVerification, UUID> {
    List<CompanionVerification> findByDocumentStatusOrSelfieStatus(VerificationStatus docStatus,
            VerificationStatus selfieStatus);
}