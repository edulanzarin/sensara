package com.sensara.api.domain.media.controller;

import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.media.model.Media;
import com.sensara.api.domain.media.model.MediaType;
import com.sensara.api.domain.media.repository.MediaRepository;
import com.sensara.api.domain.media.service.StorageService;
import com.sensara.api.domain.plan.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/companions/{companionId}/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaRepository mediaRepository;
    private final CompanionRepository companionRepository;
    private final StorageService storageService;
    private final SubscriptionService subscriptionService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Media> uploadMedia(
            @PathVariable UUID companionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") MediaType type,
            @RequestParam(value = "isProfilePicture", defaultValue = "false") Boolean isProfilePicture) {

        subscriptionService.validateMediaUploadLimit(companionId, type, isProfilePicture);

        var companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Companion not found"));

        // Se é nova foto de perfil, deleta a antiga do storage e do banco
        if (Boolean.TRUE.equals(isProfilePicture)) {
            mediaRepository.findByCompanionIdAndIsProfilePictureTrue(companionId).ifPresent(old -> {
                storageService.delete(old.getUrl());
                mediaRepository.delete(old);
            });
        }

        String fileUrl = storageService.upload(file);

        var media = Media.builder()
                .companion(companion)
                .url(fileUrl)
                .type(type)
                .isProfilePicture(isProfilePicture)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(mediaRepository.save(media));
    }

    @GetMapping
    public ResponseEntity<List<Media>> getCompanionMedia(@PathVariable UUID companionId) {
        return ResponseEntity.ok(mediaRepository.findByCompanionIdOrderByCreatedAtDesc(companionId));
    }

    @GetMapping("/stories")
    public ResponseEntity<List<Media>> getActiveStories(@PathVariable UUID companionId) {
        var threshold = LocalDateTime.now().minusHours(24);
        var stories = mediaRepository.findByCompanionIdAndTypeAndCreatedAtAfterOrderByCreatedAtDesc(
                companionId, MediaType.STORY, threshold);
        return ResponseEntity.ok(stories);
    }
}