package com.edumanage.controller;

import com.edumanage.model.User;
import com.edumanage.repository.UserRepository;
import com.edumanage.security.JwtTokenProvider;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            
            // Get user to return role and referenceId
            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

            return ResponseEntity.ok(new JwtAuthResponse(jwt, user.getRole(), user.getReferenceId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid username or password"));
        }
    }

    // A helper endpoint for development to easily create users since we don't have a registration flow
    @PostMapping("/register-dev")
    public ResponseEntity<?> registerDevUser(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken!"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setReferenceId(request.getReferenceId());

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
    
    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String role;
        private String referenceId;
    }

    @Data
    public static class JwtAuthResponse {
        private String accessToken;
        private String tokenType = "Bearer";
        private String role;
        private String referenceId;

        public JwtAuthResponse(String accessToken, String role, String referenceId) {
            this.accessToken = accessToken;
            this.role = role;
            this.referenceId = referenceId;
        }
    }
}
