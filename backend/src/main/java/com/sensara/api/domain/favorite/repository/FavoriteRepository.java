package com.sensara.api.domain.favorite.repository;

import com.sensara.api.domain.favorite.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {
    List<Favorite> findByUserId(UUID userId);

    Optional<Favorite> findByUserIdAndCompanionId(UUID userId, UUID companionId);

    boolean existsByUserIdAndCompanionId(UUID userId, UUID companionId);

    void deleteByUserIdAndCompanionId(UUID userId, UUID companionId);
}