package com.sensara.api.domain.plan.service;

import com.sensara.api.domain.media.model.MediaType;
import com.sensara.api.domain.media.repository.MediaRepository;
import com.sensara.api.domain.plan.model.Plan;
import com.sensara.api.domain.plan.model.Subscription;
import com.sensara.api.domain.plan.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final MediaRepository mediaRepository;

    public Plan getActivePlan(UUID companionId) {
        return subscriptionRepository.findByCompanionIdAndActiveTrue(companionId)
                .stream()
                .findFirst()
                .map(Subscription::getPlan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Companion does not have an active subscription"));
    }

    public Optional<Plan> findActivePlan(UUID companionId) {
        return subscriptionRepository.findByCompanionIdAndActiveTrue(companionId)
                .stream()
                .findFirst()
                .map(Subscription::getPlan);
    }

    public void validateMediaUploadLimit(UUID companionId, MediaType type, boolean isProfilePicture) {
        // Foto de perfil é sempre liberada — não exige plano
        if (isProfilePicture && type == MediaType.PHOTO) {
            long profilePicCount = mediaRepository.countByCompanionIdAndTypeAndIsProfilePicture(
                    companionId, MediaType.PHOTO, true);
            // Permite apenas 1 foto de perfil — se já tem, o controller deve deletar a
            // antiga
            return;
        }

        // Para qualquer outra mídia, exige plano ativo
        Plan activePlan = getActivePlan(companionId);

        if (type == MediaType.STORY && Boolean.FALSE.equals(activePlan.getCanPostStories())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your current plan does not allow posting stories.");
        }

        long currentCount = mediaRepository.countByCompanionIdAndType(companionId, type);

        if (type == MediaType.PHOTO && currentCount >= activePlan.getMaxPhotos()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Photo limit reached for your current plan.");
        }

        if (type == MediaType.VIDEO && currentCount >= activePlan.getMaxVideos()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Video limit reached for your current plan.");
        }
    }
}