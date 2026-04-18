package com.smartcampus.incidents.model;

import com.smartcampus.core.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_status_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketStatusEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnore
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    private TicketStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus toStatus;

    @Column(nullable = false)
    private LocalDateTime at;

    @ManyToOne(optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    /** Rejection reason when {@code toStatus == REJECTED} */
    private String note;
}
