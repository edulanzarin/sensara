package com.sensara.api.domain.media.service;

import com.sensara.api.domain.media.model.Media;
import com.sensara.api.domain.media.model.MediaType;
import com.sensara.api.domain.media.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoryCleanupService {

    private final MediaRepository mediaRepository;
    private final StorageService storageService;

    // Roda no minuto 0 de toda hora (ex: 14:00, 15:00, 16:00...)
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredStories() {
        var threshold = LocalDateTime.now().minusHours(24);
        var expiredStories = mediaRepository.findByTypeAndCreatedAtBefore(MediaType.STORY, threshold);

        if (!expiredStories.isEmpty()) {
            log.info("Deleting {} expired stories...", expiredStories.size());

            for (Media story : expiredStories) {
                storageService.delete(story.getUrl()); // Apaga do S3/Cloudinary
                mediaRepository.delete(story); // Apaga do Banco
            }
        }
    }
}