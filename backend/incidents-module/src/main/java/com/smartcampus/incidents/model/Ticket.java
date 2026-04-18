package com.smartcampus.incidents.model;

import com.smartcampus.core.model.User;
import com.smartcampus.facilities.model.Resource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    private String preferredContact;

    @ElementCollection
    @CollectionTable(name = "ticket_attachments", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "file_url")
    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private String resolutionNotes;

    /** Populated when status is {@link TicketStatus#REJECTED} */
    private String rejectionReason;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("at ASC")
    @Builder.Default
    private List<TicketStatusEvent> statusEvents = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = TicketStatus.OPEN;
    }
}
