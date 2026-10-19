package com.keystone.societyops.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtService jwtService;
    private final String username;
    private final String password;

    public AuthController(JwtService jwtService,
                          @Value("${keystone.auth.username}") String username,
                          @Value("${keystone.auth.password}") String password) {
        this.jwtService = jwtService;
        this.username = username;
        this.password = password;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        boolean correctUsername = MessageDigest.isEqual(username.getBytes(StandardCharsets.UTF_8), request.username().getBytes(StandardCharsets.UTF_8));
        boolean correctPassword = MessageDigest.isEqual(password.getBytes(StandardCharsets.UTF_8), request.password().getBytes(StandardCharsets.UTF_8));
        if (!correctUsername || !correctPassword) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect");
        }
        return Map.of("token", jwtService.issue(username, "SOCIETY_MANAGER"),
                "user", Map.of("name", "Aarav Khanna", "email", username, "role", "SOCIETY_MANAGER"));
    }

    public record LoginRequest(@NotBlank @Email String username, @NotBlank String password) { }
}
