package com.smartcampus.incidents.controller;

import com.smartcampus.core.model.Role;
import com.smartcampus.core.model.User;
import com.smartcampus.core.repository.UserRepository;
import com.smartcampus.incidents.model.Comment;
import com.smartcampus.incidents.model.Ticket;
import com.smartcampus.incidents.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    public TicketController(TicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    private User currentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody CreateTicketRequest body, Principal principal) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(body, currentUser(principal)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public List<Ticket> myTickets(Principal principal) {
        return ticketService.listMyTickets(currentUser(principal));
    }

    @GetMapping("/assignable-technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> assignableTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public List<Ticket> allTickets() {
        return ticketService.listAllForStaff();
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<?> getTicket(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(ticketService.getTicketDetail(id, currentUser(principal)));
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && e.getMessage().contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id:\\d+}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateTicketStatusRequest body,
            Principal principal) {
        try {
            return ResponseEntity.ok(ticketService.updateTicketStatus(id, body, currentUser(principal)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id:\\d+}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest body,
            Principal principal) {
        try {
            Comment c = ticketService.addComment(id, body.getContent(), currentUser(principal));
            return ResponseEntity.status(HttpStatus.CREATED).body(c);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{ticketId:\\d+}/comments/{commentId:\\d+}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestBody CommentRequest body,
            Principal principal) {
        try {
            return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, body.getContent(), currentUser(principal)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{ticketId:\\d+}/comments/{commentId:\\d+}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Principal principal) {
        try {
            ticketService.deleteComment(ticketId, commentId, currentUser(principal));
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/{id:\\d+}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files,
            Principal principal) {
        try {
            List<MultipartFile> list = files != null ? Arrays.asList(files) : List.of();
            return ResponseEntity.ok(ticketService.uploadAttachments(id, list, currentUser(principal)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (java.io.IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
        }
    }

    @PutMapping("/{id:\\d+}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assign(
            @PathVariable Long id,
            @RequestBody AssignTicketRequest body,
            Principal principal) {
        try {
            return ResponseEntity.ok(ticketService.assignTechnician(id, body, currentUser(principal)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
