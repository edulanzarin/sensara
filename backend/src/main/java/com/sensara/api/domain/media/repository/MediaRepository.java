package com.sensara.api.domain.media.repository;

import com.sensara.api.domain.media.model.Media;
import com.sensara.api.domain.media.model.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID> {

    List<Media> findByCompanionIdOrderByCreatedAtDesc(UUID companionId);

    long countByCompanionIdAndType(UUID companionId, MediaType type);

    long countByCompanionIdAndTypeAndIsProfilePicture(UUID companionId, MediaType type, Boolean isProfilePicture);

    Optional<Media> findByCompanionIdAndIsProfilePictureTrue(UUID companionId);

    List<Media> findByCompanionIdAndTypeAndCreatedAtAfterOrderByCreatedAtDesc(
            UUID companionId, MediaType type, LocalDateTime date);

    List<Media> findByTypeAndCreatedAtBefore(MediaType type, LocalDateTime date);
}