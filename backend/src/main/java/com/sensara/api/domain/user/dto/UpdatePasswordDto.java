package com.sensara.api.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdatePasswordDto(
        @NotBlank String oldPassword,
        @NotBlank String newPassword) {
}