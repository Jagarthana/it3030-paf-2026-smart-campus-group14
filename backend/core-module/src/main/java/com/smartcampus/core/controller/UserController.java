package com.smartcampus.core.controller;

import com.smartcampus.core.model.Role;
import com.smartcampus.core.model.User;
import com.smartcampus.core.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/{id:\\d+}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestBody ChangeRoleRequest request) {
        if (request.getRole() == null) {
            return ResponseEntity.badRequest().body("Role is required");
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setRole(request.getRole());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @Data
    public static class ChangeRoleRequest {
        private Role role;
    }
}
