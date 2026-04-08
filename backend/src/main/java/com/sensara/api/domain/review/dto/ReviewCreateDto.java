package com.sensara.api.domain.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ReviewCreateDto(
        @NotNull UUID companionId,
        @NotNull @Min(1) @Max(5) Integer rating,
        String comment) {
}