package com.smartcampus.bookings.controller;

import com.smartcampus.bookings.model.Booking;
import com.smartcampus.bookings.model.BookingStatus;
import com.smartcampus.bookings.repository.BookingRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
public class BookingAnalyticsController {

    private final BookingRepository bookingRepository;

    public BookingAnalyticsController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public BookingAnalyticsResponse bookingAnalytics() {
        List<Booking> approved = bookingRepository.findByStatus(BookingStatus.APPROVED);

        Map<Long, TopResource> byResource = new HashMap<>();
        Map<Integer, Long> byHour = new HashMap<>();

        for (Booking b : approved) {
            if (b.getResource() != null) {
                Long rid = b.getResource().getId();
                TopResource stat = byResource.get(rid);
                if (stat == null) {
                    stat = new TopResource(rid, b.getResource().getName(), 0L);
                    byResource.put(rid, stat);
                }
                stat.count = stat.count + 1;
            }

            if (b.getStartTime() != null) {
                int hour = b.getStartTime().getHour();
                byHour.put(hour, byHour.getOrDefault(hour, 0L) + 1);
            }
        }

        List<TopResource> topResources = new ArrayList<>(byResource.values());
        topResources.sort(Comparator.comparingLong(TopResource::getCount).reversed().thenComparing(TopResource::getResourceId));
        if (topResources.size() > 5) {
            topResources = topResources.subList(0, 5);
        }

        List<PeakHour> peakHours = new ArrayList<>();
        for (Map.Entry<Integer, Long> e : byHour.entrySet()) {
            peakHours.add(new PeakHour(e.getKey(), e.getValue()));
        }
        peakHours.sort(Comparator.comparingLong(PeakHour::getCount).reversed().thenComparingInt(PeakHour::getHour));
        if (peakHours.size() > 5) {
            peakHours = peakHours.subList(0, 5);
        }

        return new BookingAnalyticsResponse(topResources, peakHours, approved.size());
    }

    @Data
    @AllArgsConstructor
    public static class BookingAnalyticsResponse {
        private List<TopResource> topResources;
        private List<PeakHour> peakBookingStartHours;
        private int approvedBookingsCount;
    }

    @Data
    @AllArgsConstructor
    public static class TopResource {
        private Long resourceId;
        private String resourceName;
        private long count;
    }

    @Data
    @AllArgsConstructor
    public static class PeakHour {
        private int hour;
        private long count;
    }
}

