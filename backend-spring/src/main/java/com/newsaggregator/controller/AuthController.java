package com.newsaggregator.controller;

import com.newsaggregator.model.User;
import com.newsaggregator.repository.UserRepository;
import com.newsaggregator.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Signup Request DTO
    public record SignUpRequest(
            @Valid String name,
            @Valid String email,
            String phone,
            @Valid String password,
            String role
    ) {}

    // Login Request DTO
    public record LoginRequest(
            @Valid String email,
            @Valid String password
    ) {}

    // Auth Response DTO
    public record AuthResponse(
            String token,
            Long id,
            String name,
            String email,
            String role
    ) {}

    // Message Response DTO
    public record MessageResponse(String message) {}

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.email())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Set default role to USER if not specified or invalid
        String role = signUpRequest.role();
        if (role == null || (!role.equalsIgnoreCase("USER") && !role.equalsIgnoreCase("ADMIN"))) {
            role = "USER";
        } else {
            role = role.toUpperCase();
        }

        // Create new user's account
        User user = new User(
                signUpRequest.name(),
                signUpRequest.email(),
                signUpRequest.phone(),
                passwordEncoder.encode(signUpRequest.password()),
                role
        );

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.email());

        if (userOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: Invalid email or password!"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: Invalid email or password!"));
        }

        // Generate token
        String jwt = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getName(), user.getRole());

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(user);
    }
}
