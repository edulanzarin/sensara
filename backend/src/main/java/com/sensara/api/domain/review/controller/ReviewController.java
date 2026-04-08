package com.sensara.api.domain.review.controller;

import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.review.dto.ReviewCreateDto;
import com.sensara.api.domain.review.model.Review;
import com.sensara.api.domain.review.repository.ReviewRepository;
import com.sensara.api.domain.user.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final CompanionRepository companionRepository;

    @PostMapping
    public ResponseEntity<Review> create(
            @RequestBody @Valid ReviewCreateDto dto,
            @AuthenticationPrincipal User client) {

        var companion = companionRepository.findById(dto.companionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Companion not found"));

        var review = Review.builder()
                .client(client)
                .companion(companion)
                .rating(dto.rating())
                .comment(dto.comment())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(reviewRepository.save(review));
    }

    @GetMapping("/companion/{companionId}")
    public ResponseEntity<Page<Review>> listByCompanion(
            @PathVariable UUID companionId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewRepository.findByCompanionId(companionId, pageable));
    }
}