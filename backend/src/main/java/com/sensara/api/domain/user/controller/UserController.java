package com.sensara.api.domain.user.controller;

import com.sensara.api.domain.user.dto.UserCreateDto;
import com.sensara.api.domain.user.model.User;
import com.sensara.api.domain.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<Void> createUser(@RequestBody @Valid UserCreateDto dto) {
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já em uso.");
        }

        var user = User.builder()
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password()))
                .role(dto.role())
                .build();

        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

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