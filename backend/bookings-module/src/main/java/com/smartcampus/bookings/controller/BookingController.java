package com.smartcampus.bookings.controller;
//booking Controller
import com.smartcampus.bookings.model.Booking;
import com.smartcampus.bookings.model.BookingStatus;
import com.smartcampus.bookings.repository.BookingRepository;
import com.smartcampus.bookings.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/my")
    public List<Booking> getMyBookings(Principal principal) {
        return bookingService.getMyBookings(principal.getName());
    }

    /**
     * Live conflict check against APPROVED bookings (for UI warning while picking a time).
     */
    @GetMapping("/conflict-check")
    public ResponseEntity<ConflictCheckResponse> conflictCheck(
            @RequestParam Long resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        boolean conflict = bookingService.hasApprovedConflict(resourceId, startTime, endTime);
        return ResponseEntity.ok(new ConflictCheckResponse(conflict));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> getAllBookings(@RequestParam(required = false) BookingStatus status) {
        if (status != null) {
            return bookingRepository.findByStatus(status);
        }
        return bookingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request, Principal principal) {
        try {
            Booking data = Booking.builder()
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .purpose(request.getPurpose())
                    .expectedAttendees(request.getExpectedAttendees())
                    .build();
            return ResponseEntity.ok(bookingService.createBooking(request.getResourceId(), principal.getName(), data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id:\\d+}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, BookingStatus.APPROVED, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id:\\d+}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, @RequestBody(required = false) RejectBookingRequest body) {
        try {
            String reason = body != null ? body.getReason() : null;
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, BookingStatus.REJECTED, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id:\\d+}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id, principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
