package com.sensara.api.domain.companion.dto;

public record DashboardDto(
        Integer profileViews,
        Long whatsappClicks,
        Double averageRating,
        String activePlanName) {
}