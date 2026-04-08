package com.sensara.api.domain.user.controller;

import com.sensara.api.domain.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<UserMeResponse> getMe(@AuthenticationPrincipal User loggedUser) {
        return ResponseEntity.ok(new UserMeResponse(
                loggedUser.getId(),
                loggedUser.getEmail(),
                loggedUser.getRole().name()));
    }

    public record UserMeResponse(UUID id, String email, String role) {
    }
}