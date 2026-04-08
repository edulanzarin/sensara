package com.sensara.api.domain.user.dto;

import com.sensara.api.domain.user.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserCreateDto(
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotNull UserRole role) {
}