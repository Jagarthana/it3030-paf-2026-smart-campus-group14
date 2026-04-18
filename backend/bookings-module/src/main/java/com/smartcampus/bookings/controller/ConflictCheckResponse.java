package com.smartcampus.bookings.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConflictCheckResponse {
    private boolean conflict;
}
