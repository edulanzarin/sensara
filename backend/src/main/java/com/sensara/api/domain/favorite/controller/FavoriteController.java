package com.sensara.api.domain.favorite.controller;

import com.sensara.api.domain.companion.dto.CompanionPublicDto;
import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.favorite.model.Favorite;
import com.sensara.api.domain.favorite.repository.FavoriteRepository;
import com.sensara.api.domain.media.repository.MediaRepository;
import com.sensara.api.domain.companion.repository.VerificationRepository;
import com.sensara.api.domain.user.model.User;
import com.sensara.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final CompanionRepository companionRepository;
    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;
    private final VerificationRepository verificationRepository;

    @GetMapping
    public ResponseEntity<List<CompanionPublicDto>> getMyFavorites(
            @AuthenticationPrincipal User loggedUser) {

        var favorites = favoriteRepository.findByUserId(loggedUser.getId());

        var dtos = favorites.stream()
                .map(f -> toPublicDto(f.getCompanion()))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{companionId}")
    public ResponseEntity<Void> addFavorite(
            @PathVariable UUID companionId,
            @AuthenticationPrincipal User loggedUser) {

        if (favoriteRepository.existsByUserIdAndCompanionId(loggedUser.getId(), companionId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already favorited");
        }

        var companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Companion not found"));

        var favorite = Favorite.builder()
                .user(loggedUser)
                .companion(companion)
                .build();

        favoriteRepository.save(favorite);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{companionId}")
    @Transactional
    public ResponseEntity<Void> removeFavorite(
            @PathVariable UUID companionId,
            @AuthenticationPrincipal User loggedUser) {

        favoriteRepository.deleteByUserIdAndCompanionId(loggedUser.getId(), companionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{companionId}/status")
    public ResponseEntity<FavoriteStatusResponse> checkFavorite(
            @PathVariable UUID companionId,
            @AuthenticationPrincipal User loggedUser) {

        boolean isFavorite = favoriteRepository.existsByUserIdAndCompanionId(
                loggedUser.getId(), companionId);
        return ResponseEntity.ok(new FavoriteStatusResponse(isFavorite));
    }

    private CompanionPublicDto toPublicDto(
            com.sensara.api.domain.companion.model.Companion c) {

        String profilePicUrl = mediaRepository
                .findByCompanionIdAndIsProfilePictureTrue(c.getId())
                .map(m -> m.getUrl())
                .orElse(null);

        int score = verificationRepository.findById(c.getId())
                .map(v -> v.getReliabilityScore())
                .orElse(0);

        return new CompanionPublicDto(
                c.getId(), c.getNickname(), c.getBio(), c.getAge(),
                c.getHeight(), c.getWeight(), c.getEthnicity(),
                c.getHairColor(), c.getEyeColor(), c.getState(),
                c.getCity(), c.getNeighborhood(), c.getBasePrice(),
                c.getVerified(), c.getProfileViews(), profilePicUrl, score);
    }

    public record FavoriteStatusResponse(boolean isFavorite) {
    }
}