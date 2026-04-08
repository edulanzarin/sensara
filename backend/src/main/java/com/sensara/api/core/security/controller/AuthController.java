package com.sensara.api.core.security.controller;

import com.sensara.api.domain.user.model.User;
import com.sensara.api.core.security.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public record LoginRequest(String email, String password) {
    }

    public record LoginResponse(String token) {
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest dto) {
        // Cria o token padrão do Spring em memória com os dados do request
        var usernamePassword = new UsernamePasswordAuthenticationToken(dto.email(), dto.password());

        // Dispara a validação. O Spring vai usar o AuthorizationService que criamos
        // acima para validar a senha
        var auth = this.authenticationManager.authenticate(usernamePassword);

        // Se a senha bater, gera o JWT
        var token = tokenService.generateToken((User) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponse(token));
    }
}