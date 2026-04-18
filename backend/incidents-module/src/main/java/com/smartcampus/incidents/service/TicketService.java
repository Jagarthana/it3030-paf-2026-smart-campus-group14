package com.smartcampus.incidents.service;

import com.smartcampus.core.model.Notification;
import com.smartcampus.core.model.Role;
import com.smartcampus.core.model.User;
import com.smartcampus.core.repository.NotificationRepository;
import com.smartcampus.core.repository.UserRepository;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.repository.ResourceRepository;
import com.smartcampus.incidents.controller.AssignTicketRequest;
import com.smartcampus.incidents.controller.CreateTicketRequest;
import com.smartcampus.incidents.controller.UpdateTicketStatusRequest;
import com.smartcampus.incidents.model.Comment;
import com.smartcampus.incidents.model.Ticket;
import com.smartcampus.incidents.model.TicketStatus;
import com.smartcampus.incidents.model.TicketStatusEvent;
import com.smartcampus.incidents.repository.CommentRepository;
import com.smartcampus.incidents.repository.TicketRepository;
import com.smartcampus.incidents.repository.TicketStatusEventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketStatusEventRepository ticketStatusEventRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadRoot;

    public TicketService(
            TicketRepository ticketRepository,
            CommentRepository commentRepository,
            TicketStatusEventRepository ticketStatusEventRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            ResourceRepository resourceRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.ticketStatusEventRepository = ticketStatusEventRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
    }

    @Transactional
    public Ticket createTicket(CreateTicketRequest req, User reporter) {
        Resource resource = resourceRepository.findById(req.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        if (req.getCategory() == null || req.getCategory().isBlank()
                || req.getDescription() == null || req.getDescription().isBlank()) {
            throw new IllegalArgumentException("Category and description are required");
        }
        Ticket ticket = Ticket.builder()
                .resource(resource)
                .reporter(reporter)
                .category(req.getCategory().trim())
                .description(req.getDescription().trim())
                .priority(req.getPriority() != null && !req.getPriority().isBlank() ? req.getPriority().trim() : "MEDIUM")
                .preferredContact(req.getPreferredContact())
                .status(TicketStatus.OPEN)
                .attachments(new ArrayList<>())
                .comments(new ArrayList<>())
                .statusEvents(new ArrayList<>())
                .build();
        Ticket saved = ticketRepository.save(ticket);
        TicketStatusEvent created = TicketStatusEvent.builder()
                .ticket(saved)
                .fromStatus(null)
                .toStatus(TicketStatus.OPEN)
                .at(saved.getCreatedAt())
                .actor(reporter)
                .note("Ticket created")
                .build();
        ticketStatusEventRepository.save(created);
        return loadTicketDetail(saved.getId());
    }

    @Transactional(readOnly = true)
    public Ticket getTicketDetail(Long id, User viewer) {
        Ticket ticket = loadTicketDetail(id);
        assertCanView(viewer, ticket);
        return ticket;
    }

    @Transactional(readOnly = true)
    public List<Ticket> listMyTickets(User reporter) {
        return ticketRepository.findByReporterId(reporter.getId());
    }

    @Transactional(readOnly = true)
    public List<Ticket> listAllForStaff() {
        return ticketRepository.findAll();
    }

    @Transactional
    public Ticket updateTicketStatus(Long ticketId, UpdateTicketStatusRequest body, User actor) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        TicketStatus target = body.getStatus();
        if (target == null) {
            throw new IllegalArgumentException("Status is required");
        }
        assertCanChangeStatus(actor, ticket, target);

        TicketStatus from = ticket.getStatus();
        validateTransition(from, target, body.getReason());

        ticket.setStatus(target);
        if (target == TicketStatus.REJECTED) {
            ticket.setRejectionReason(body.getReason() != null ? body.getReason().trim() : null);
        } else if (body.getReason() != null && !body.getReason().isBlank()) {
            ticket.setRejectionReason(null);
        }
        if (body.getResolutionNotes() != null) {
            ticket.setResolutionNotes(body.getResolutionNotes());
        }

        Ticket saved = ticketRepository.save(ticket);

        TicketStatusEvent ev = TicketStatusEvent.builder()
                .ticket(saved)
                .fromStatus(from)
                .toStatus(target)
                .at(LocalDateTime.now())
                .actor(actor)
                .note(target == TicketStatus.REJECTED ? ticket.getRejectionReason() : null)
                .build();
        ticketStatusEventRepository.save(ev);

        String notifMsg = String.format("Ticket #%d status updated to %s.", saved.getId(), target.name());
        notificationRepository.save(Notification.builder()
                .recipient(ticket.getReporter())
                .message(notifMsg)
                .readStatus(false)
                .build());

        return loadTicketDetail(saved.getId());
    }

    @Transactional
    public Ticket assignTechnician(Long ticketId, AssignTicketRequest body, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only administrators can assign technicians");
        }
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        if (isTerminal(ticket.getStatus())) {
            throw new IllegalArgumentException("Cannot assign a closed or rejected ticket");
        }
        if (body.getTechnicianId() == null) {
            throw new IllegalArgumentException("technicianId is required");
        }
        User tech = userRepository.findById(body.getTechnicianId())
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));
        if (tech.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("User is not a technician");
        }
        ticket.setAssignee(tech);
        Ticket saved = ticketRepository.save(ticket);

        notificationRepository.save(Notification.builder()
                .recipient(tech)
                .message(String.format("You have been assigned to Ticket #%d.", saved.getId()))
                .readStatus(false)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(saved.getReporter())
                .message(String.format("Ticket #%d has been assigned to %s.", saved.getId(), tech.getName()))
                .readStatus(false)
                .build());

        return loadTicketDetail(saved.getId());
    }

    @Transactional
    public Comment addComment(Long ticketId, String content, User author) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Comment content is required");
        }
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        assertCanView(author, ticket);

        Comment comment = Comment.builder()
                .ticket(ticket)
                .author(author)
                .content(content.trim())
                .build();
        Comment savedComment = commentRepository.save(comment);

        String notifMsg = String.format("New comment on Ticket #%d by %s.", ticket.getId(), author.getName());
        if (author.getId().equals(ticket.getReporter().getId()) && ticket.getAssignee() != null) {
            notificationRepository.save(Notification.builder()
                    .recipient(ticket.getAssignee())
                    .message(notifMsg)
                    .readStatus(false)
                    .build());
        } else if (!author.getId().equals(ticket.getReporter().getId())) {
            notificationRepository.save(Notification.builder()
                    .recipient(ticket.getReporter())
                    .message(notifMsg)
                    .readStatus(false)
                    .build());
        }

        return savedComment;
    }

    @Transactional
    public Comment updateComment(Long ticketId, Long commentId, String content, User author) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Comment content is required");
        }
        Comment comment = commentRepository.findByIdAndAuthor_Id(commentId, author.getId())
                .orElseThrow(() -> new IllegalArgumentException("Comment not found or not yours"));
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }
        comment.setContent(content.trim());
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId, User author) {
        Comment comment = commentRepository.findByIdAndAuthor_Id(commentId, author.getId())
                .orElseThrow(() -> new IllegalArgumentException("Comment not found or not yours"));
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public Ticket uploadAttachments(Long ticketId, List<MultipartFile> files, User actor) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        if (isTerminal(ticket.getStatus())) {
            throw new IllegalArgumentException("Cannot attach files to a closed or rejected ticket");
        }
        assertCanUpload(actor, ticket);

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("No files provided");
        }

        int existing = ticket.getAttachments() != null ? ticket.getAttachments().size() : 0;
        int incoming = (int) files.stream().filter(f -> f != null && !f.isEmpty()).count();
        if (existing + incoming > 3) {
            throw new IllegalArgumentException("Maximum of 3 image attachments per ticket");
        }

        Path root = Paths.get(uploadRoot).toAbsolutePath().normalize();
        Path dir = root.resolve("tickets").resolve(String.valueOf(ticketId));
        Files.createDirectories(dir);

        List<String> urls = ticket.getAttachments() != null ? new ArrayList<>(ticket.getAttachments()) : new ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String ct = file.getContentType();
            if (ct == null || !(ct.equals("image/png") || ct.equals("image/jpeg") || ct.equals("image/webp") || ct.equals("image/gif"))) {
                throw new IllegalArgumentException("Only PNG, JPEG, WebP, or GIF images are allowed");
            }
            String orig = file.getOriginalFilename();
            String ext = "";
            if (orig != null && orig.contains(".")) {
                ext = orig.substring(orig.lastIndexOf('.'));
            }
            String stored = UUID.randomUUID() + ext;
            Path target = dir.resolve(stored);
            Files.copy(file.getInputStream(), target);
            String publicUrl = "/uploads/tickets/" + ticketId + "/" + stored;
            urls.add(publicUrl);
        }

        ticket.setAttachments(urls);
        ticketRepository.save(ticket);
        return loadTicketDetail(ticketId);
    }

    private Ticket loadTicketDetail(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        ticket.getStatusEvents().size();
        ticket.getComments().size();
        return ticket;
    }

    private static boolean isTerminal(TicketStatus s) {
        return s == TicketStatus.CLOSED || s == TicketStatus.REJECTED;
    }

    private void assertCanView(User viewer, Ticket ticket) {
        if (viewer.getRole() == Role.ADMIN || viewer.getRole() == Role.TECHNICIAN) {
            return;
        }
        if (ticket.getReporter().getId().equals(viewer.getId())) {
            return;
        }
        if (ticket.getAssignee() != null && ticket.getAssignee().getId().equals(viewer.getId())) {
            return;
        }
        throw new IllegalArgumentException("Not authorized to view this ticket");
    }

    private void assertCanUpload(User actor, Ticket ticket) {
        if (actor.getRole() == Role.ADMIN) {
            return;
        }
        if (ticket.getReporter().getId().equals(actor.getId())) {
            return;
        }
        if (ticket.getAssignee() != null && ticket.getAssignee().getId().equals(actor.getId())) {
            return;
        }
        throw new IllegalArgumentException("Not authorized to add attachments");
    }

    private void assertCanChangeStatus(User actor, Ticket ticket, TicketStatus target) {
        if (actor.getRole() == Role.ADMIN) {
            return;
        }
        if (actor.getRole() == Role.TECHNICIAN) {
            if (ticket.getAssignee() == null || !ticket.getAssignee().getId().equals(actor.getId())) {
                throw new IllegalArgumentException("Only the assigned technician can update this ticket");
            }
            if (target == TicketStatus.REJECTED) {
                throw new IllegalArgumentException("Technicians cannot reject tickets");
            }
            if (target != TicketStatus.IN_PROGRESS && target != TicketStatus.RESOLVED && target != TicketStatus.CLOSED) {
                throw new IllegalArgumentException("Invalid status for technician");
            }
            return;
        }
        throw new IllegalArgumentException("Not authorized to change ticket status");
    }

    private static void validateTransition(TicketStatus from, TicketStatus to, String reason) {
        if (from == to) {
            throw new IllegalArgumentException("Status is already " + from);
        }
        if (from == TicketStatus.CLOSED || from == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Ticket is terminal; status cannot change");
        }
        switch (from) {
            case OPEN -> {
                if (to != TicketStatus.IN_PROGRESS && to != TicketStatus.REJECTED) {
                    throw new IllegalArgumentException("Invalid transition from OPEN");
                }
                if (to == TicketStatus.REJECTED && (reason == null || reason.isBlank())) {
                    throw new IllegalArgumentException("Rejection reason is required");
                }
            }
            case IN_PROGRESS -> {
                if (to != TicketStatus.RESOLVED && to != TicketStatus.REJECTED) {
                    throw new IllegalArgumentException("Invalid transition from IN_PROGRESS");
                }
                if (to == TicketStatus.REJECTED && (reason == null || reason.isBlank())) {
                    throw new IllegalArgumentException("Rejection reason is required");
                }
            }
            case RESOLVED -> {
                if (to != TicketStatus.CLOSED) {
                    throw new IllegalArgumentException("Only CLOSED is allowed after RESOLVED");
                }
            }
            default -> throw new IllegalArgumentException("Unsupported transition");
        }
    }
}
