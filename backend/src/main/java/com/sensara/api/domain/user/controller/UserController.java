package com.sensara.api.domain.user.controller;

import com.sensara.api.domain.user.dto.UserCreateDto;
import com.sensara.api.domain.user.dto.UpdatePasswordDto;
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

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder; // injetado para criptografia

    @PostMapping
    public ResponseEntity<User> create(@RequestBody @Valid UserCreateDto dto) {
        var user = User.builder()
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password())) // Senha agora é salva criptografada
                .role(dto.role())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(user));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(
            @RequestBody @Valid UpdatePasswordDto dto,
            @AuthenticationPrincipal User loggedUser) {

        if (!passwordEncoder.matches(dto.oldPassword(), loggedUser.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password does not match");
        }

        loggedUser.setPassword(passwordEncoder.encode(dto.newPassword()));
        repository.save(loggedUser);

        return ResponseEntity.noContent().build();
    }
}