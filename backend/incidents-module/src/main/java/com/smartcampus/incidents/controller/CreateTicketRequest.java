package com.smartcampus.incidents.controller;

import lombok.Data;

@Data
public class CreateTicketRequest {
    private Long resourceId;
    private String category;
    private String description;
    private String priority;
    private String preferredContact;
}
