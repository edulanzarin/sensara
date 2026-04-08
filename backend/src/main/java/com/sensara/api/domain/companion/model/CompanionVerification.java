package com.sensara.api.domain.companion.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "companion_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanionVerification {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "companion_id")
    private Companion companion;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus documentStatus = VerificationStatus.NOT_SUBMITTED;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus selfieStatus = VerificationStatus.NOT_SUBMITTED;

    @Builder.Default
    private Boolean phoneVerified = false;

    @Column(length = 500)
    private String selfieUrl;

    @Column(length = 500)
    private String documentUrl;

    public Integer getReliabilityScore() {
        int score = 0;
        if (this.documentStatus == VerificationStatus.APPROVED)
            score += 50;
        if (this.selfieStatus == VerificationStatus.APPROVED)
            score += 50;
        return score;
    }
}