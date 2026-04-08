package com.sensara.api.domain.companion.dto;

import java.math.BigDecimal;

public record CompanionUpdateDto(
        String nickname,
        String bio,
        Integer age,
        Double height,
        Double weight,
        String ethnicity,
        String hairColor,
        String eyeColor,
        String state,
        String city,
        String neighborhood,
        String whatsapp,
        BigDecimal basePrice) {
}