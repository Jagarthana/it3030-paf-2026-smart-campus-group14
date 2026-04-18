package com.smartcampus.incidents.controller;

import com.smartcampus.incidents.model.TicketStatus;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    private TicketStatus status;
    /** Required when moving to {@link TicketStatus#REJECTED} */
    private String reason;
    private String resolutionNotes;
}
