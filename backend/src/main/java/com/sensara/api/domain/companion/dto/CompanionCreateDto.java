package com.sensara.api.domain.companion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CompanionCreateDto(
        @NotBlank String nickname,
        String bio,
        @NotNull Integer age,
        Double height,
        Double weight,
        String ethnicity,
        String hairColor,
        String eyeColor,
        @NotBlank String state,
        @NotBlank String city,
        String neighborhood,
        @NotBlank String whatsapp,
        BigDecimal basePrice) {
}