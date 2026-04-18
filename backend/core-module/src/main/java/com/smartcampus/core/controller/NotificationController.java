package com.smartcampus.core.controller;

import com.smartcampus.core.model.Notification;
import com.smartcampus.core.model.User;
import com.smartcampus.core.repository.NotificationRepository;
import com.smartcampus.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Notification> getMyNotifications(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(user.getId());
    }

    @PutMapping("/{id:\\d+}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null || !notification.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        notification.setReadStatus(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(notification);
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null || !notification.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        notificationRepository.delete(notification);
        return ResponseEntity.noContent().build();
    }
}
