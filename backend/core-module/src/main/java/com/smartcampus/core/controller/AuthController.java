package com.smartcampus.core.controller;

import com.smartcampus.core.model.Role;
import com.smartcampus.core.model.User;
import com.smartcampus.core.repository.UserRepository;
import com.smartcampus.core.security.JwtService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        Role role = request.getRole() != null ? request.getRole() : Role.USER;
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        user = userRepository.save(user);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/oauth2/google")
    public ResponseEntity<Void> oauth2Google() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "/oauth2/authorization/google")
                .build();
    }

    /**
     * Local mock path for environments where real Google OAuth is unavailable.
     */
    @PostMapping("/mock-google")
    public ResponseEntity<?> mockGoogle(@RequestBody MockGoogleRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase(Locale.ROOT) : "";
        if (!(email.endsWith("@my.sliit.lk") || email.endsWith("@sliit.lk"))) {
            return ResponseEntity.badRequest().body("Google Sign-In is restricted to SLIIT domains.");
        }
        String fallbackName = email.contains("@") ? email.substring(0, email.indexOf('@')) : "Google User";
        String name = (request.getName() == null || request.getName().isBlank()) ? fallbackName : request.getName().trim();

        User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .email(email)
                .name(name)
                .role(Role.USER)
                .password(passwordEncoder.encode("oauth2-user"))
                .build()));

        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(name);
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private Role role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MockGoogleRequest {
        private String email;
        private String name;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private User user;
    }
}
