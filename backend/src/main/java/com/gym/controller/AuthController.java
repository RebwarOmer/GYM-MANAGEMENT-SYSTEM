package com.gym.controller;

import com.gym.dto.LoginRequest;
import com.gym.dto.LoginResponse;
import com.gym.model.User;
import com.gym.repository.UserRepository;
import com.gym.security.JwtUtil;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElse(null);
        if (user == null || !isPasswordValid(user, loginRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }

        return ResponseEntity.ok(LoginResponse.builder()
                .token(jwtUtil.generateToken(user.getUsername()))
                .username(user.getUsername())
                .build());
    }

    private boolean isPasswordValid(User user, String password) {
        return user.getPasswordHash() != null && user.getPasswordHash().equals(password);
    }
}
