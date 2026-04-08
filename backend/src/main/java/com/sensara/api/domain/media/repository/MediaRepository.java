package com.sensara.api.domain.media.repository;

import com.sensara.api.domain.media.model.Media;
import com.sensara.api.domain.media.model.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByCompanionIdOrderByCreatedAtDesc(UUID companionId);

    long countByCompanionIdAndType(UUID companionId, MediaType type);

    // Busca stories ativos
    List<Media> findByCompanionIdAndTypeAndCreatedAtAfterOrderByCreatedAtDesc(UUID companionId, MediaType type,
            LocalDateTime date);

    // Busca stories expirados para o robô apagar
    List<Media> findByTypeAndCreatedAtBefore(MediaType type, LocalDateTime date);
}