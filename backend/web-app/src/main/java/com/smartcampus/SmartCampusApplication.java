package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import com.smartcampus.core.model.Role;
import com.smartcampus.core.model.User;
import com.smartcampus.core.repository.UserRepository;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceStatus;
import com.smartcampus.facilities.model.ResourceType;
import com.smartcampus.facilities.repository.ResourceRepository;
import com.smartcampus.bookings.model.Booking;
import com.smartcampus.bookings.model.BookingStatus;
import com.smartcampus.bookings.repository.BookingRepository;
import com.smartcampus.incidents.model.Ticket;
import com.smartcampus.incidents.model.TicketStatus;
import com.smartcampus.incidents.model.TicketStatusEvent;
import com.smartcampus.incidents.repository.TicketRepository;
import com.smartcampus.incidents.repository.TicketStatusEventRepository;

import java.time.LocalDateTime;
import java.time.LocalTime;

@SpringBootApplication
public class SmartCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseSeeder(
        UserRepository userRepo, 
        ResourceRepository resourceRepo,
        BookingRepository bookingRepo,
        TicketRepository ticketRepo,
        TicketStatusEventRepository ticketStatusEventRepo,
        org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return _ -> {
            User admin = userRepo.findByEmail("admin@sliit.lk").orElse(new User());
            admin.setName("Admin User");
            admin.setEmail("admin@sliit.lk");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole(Role.ADMIN);
            admin = userRepo.save(admin);
            
            User tech = userRepo.findByEmail("tech@sliit.lk").orElse(new User());
            tech.setName("Technician");
            tech.setEmail("tech@sliit.lk");
            tech.setPassword(passwordEncoder.encode("password123"));
            tech.setRole(Role.TECHNICIAN);
            userRepo.save(tech);

            User student = userRepo.findByEmail("it12345678@my.sliit.lk").orElse(new User());
            student.setName("Student IT12345678");
            student.setEmail("it12345678@my.sliit.lk");
            student.setPassword(passwordEncoder.encode("password123"));
            student.setRole(Role.USER);
            userRepo.save(student);

            if (resourceRepo.count() == 0) {
                Resource r1 = Resource.builder()
                        .name("Main Auditorium (FOSS)")
                        .type(ResourceType.LECTURE_HALL)
                        .capacity(300)
                        .location("Block A, Level 1")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(20, 0))
                        .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build();
                r1 = resourceRepo.save(r1);

                Resource r2 = Resource.builder()
                        .name("Strategic Computing Lab 4")
                        .type(ResourceType.LAB)
                        .capacity(40)
                        .location("Block B, Level 3")
                        .availableFrom(LocalTime.of(9, 0))
                        .availableTo(LocalTime.of(18, 0))
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build();
                r2 = resourceRepo.save(r2);

                resourceRepo.save(Resource.builder()
                        .name("Innovation Hub — Meeting Room 2A")
                        .type(ResourceType.MEETING_ROOM)
                        .capacity(12)
                        .location("Block A1, Level 2, East Wing")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(22, 0))
                        .imageUrl("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Electronics Workshop Lab")
                        .type(ResourceType.LAB)
                        .capacity(32)
                        .location("Block B, Level 1, Lab Wing")
                        .availableFrom(LocalTime.of(9, 0))
                        .availableTo(LocalTime.of(17, 0))
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Seminar Room 7 — Cybersecurity")
                        .type(ResourceType.LECTURE_HALL)
                        .capacity(80)
                        .location("Block C, Level 4, Room C407")
                        .availableFrom(LocalTime.of(8, 30))
                        .availableTo(LocalTime.of(19, 0))
                        .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("4K Portable Projector Set (Pool)")
                        .type(ResourceType.EQUIPMENT)
                        .capacity(1)
                        .location("Media Services, Block A, Ground Floor")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(18, 0))
                        .imageUrl("https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("VR / AR Development Lab")
                        .type(ResourceType.LAB)
                        .capacity(24)
                        .location("Block B, Level 3, Room B315")
                        .availableFrom(LocalTime.of(10, 0))
                        .availableTo(LocalTime.of(18, 0))
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.OUT_OF_SERVICE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Executive Boardroom — Faculty")
                        .type(ResourceType.MEETING_ROOM)
                        .capacity(20)
                        .location("Admin Building, Level 5")
                        .availableFrom(LocalTime.of(9, 0))
                        .availableTo(LocalTime.of(17, 30))
                        .imageUrl("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("North Lecture Theatre (NLT)")
                        .type(ResourceType.LECTURE_HALL)
                        .capacity(250)
                        .location("Block A1, Ground Floor")
                        .availableFrom(LocalTime.of(7, 30))
                        .availableTo(LocalTime.of(21, 0))
                        .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Drone Fleet — Field Kit (Borrow)")
                        .type(ResourceType.EQUIPMENT)
                        .capacity(4)
                        .location("Robotics Lab Stores, Block D")
                        .availableFrom(LocalTime.of(9, 0))
                        .availableTo(LocalTime.of(16, 0))
                        .imageUrl("https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Chemistry Prep Lab")
                        .type(ResourceType.LAB)
                        .capacity(28)
                        .location("Science Block S1, Level 2")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(17, 0))
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Studio A — Podcast & Recording")
                        .type(ResourceType.MEETING_ROOM)
                        .capacity(8)
                        .location("Block A1, Level 1, Media Suite")
                        .availableFrom(LocalTime.of(9, 0))
                        .availableTo(LocalTime.of(20, 0))
                        .imageUrl("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Data Centre Tour — Observation Gallery")
                        .type(ResourceType.LECTURE_HALL)
                        .capacity(45)
                        .location("Block A1, Basement, DC Wing")
                        .availableFrom(LocalTime.of(10, 0))
                        .availableTo(LocalTime.of(16, 0))
                        .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Network Engineering Lab 2")
                        .type(ResourceType.LAB)
                        .capacity(36)
                        .location("Block B, Level 2, Room B210")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(19, 0))
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Huddle Room 3B — Quick Sync")
                        .type(ResourceType.MEETING_ROOM)
                        .capacity(6)
                        .location("Block A1, Level 3, West Corridor")
                        .availableFrom(LocalTime.of(7, 0))
                        .availableTo(LocalTime.of(22, 0))
                        .imageUrl("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("PA System — Portable Array (Set of 2)")
                        .type(ResourceType.EQUIPMENT)
                        .capacity(2)
                        .location("Events Office, Block A, Ground Floor")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(18, 0))
                        .imageUrl("https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("South Campus Lecture Hall 2 (SCLH-2)")
                        .type(ResourceType.LECTURE_HALL)
                        .capacity(180)
                        .location("South Campus, Building S, Level 1")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(21, 30))
                        .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Software Testing & QA Lab")
                        .type(ResourceType.LAB)
                        .capacity(30)
                        .location("Block C, Level 2, Room C205")
                        .availableFrom(LocalTime.of(9, 0))
                        .availableTo(LocalTime.of(18, 0))
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Library Group Study Pod — G14")
                        .type(ResourceType.MEETING_ROOM)
                        .capacity(10)
                        .location("Main Library, Block L, Level 2")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(22, 0))
                        .imageUrl("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("3D Printer Farm — Engineering Loan")
                        .type(ResourceType.EQUIPMENT)
                        .capacity(6)
                        .location("Fab Lab, Block D, Level 1")
                        .availableFrom(LocalTime.of(9, 0))
                        .availableTo(LocalTime.of(17, 0))
                        .imageUrl("https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.OUT_OF_SERVICE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Language Lab — Multilingual Booths")
                        .type(ResourceType.LAB)
                        .capacity(22)
                        .location("Humanities Block H, Level 1")
                        .availableFrom(LocalTime.of(8, 30))
                        .availableTo(LocalTime.of(17, 30))
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Open Seminar Space — Atrium")
                        .type(ResourceType.LECTURE_HALL)
                        .capacity(120)
                        .location("Central Atrium, Block A1, Ground Floor")
                        .availableFrom(LocalTime.of(9, 0))
                        .availableTo(LocalTime.of(20, 0))
                        .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Photography Darkroom (Analog)")
                        .type(ResourceType.LAB)
                        .capacity(12)
                        .location("Arts Block AR, Basement")
                        .availableFrom(LocalTime.of(10, 0))
                        .availableTo(LocalTime.of(18, 0))
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                resourceRepo.save(Resource.builder()
                        .name("Wireless Presentation Clickers (Bulk)")
                        .type(ResourceType.EQUIPMENT)
                        .capacity(25)
                        .location("IT Helpdesk, Block A1, Level 0")
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(17, 0))
                        .imageUrl("https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200")
                        .status(ResourceStatus.ACTIVE)
                        .build());

                Booking b = Booking.builder()
                        .user(admin)
                        .resource(r1)
                        .startTime(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0))
                        .endTime(LocalDateTime.now().plusDays(2).withHour(12).withMinute(0))
                        .purpose("Strategic Planning Sync")
                        .expectedAttendees(50)
                        .status(BookingStatus.APPROVED)
                        .build();
                bookingRepo.save(b);

                Ticket t = Ticket.builder()
                        .reporter(admin)
                        .assignee(tech)
                        .resource(r2)
                        .category("Hardware")
                        .priority("HIGH")
                        .status(TicketStatus.OPEN)
                        .description("Primary workstation GPU failure in Rack 2.")
                        .createdAt(LocalDateTime.now().minusHours(2))
                        .build();
                t = ticketRepo.save(t);
                ticketStatusEventRepo.save(TicketStatusEvent.builder()
                        .ticket(t)
                        .fromStatus(null)
                        .toStatus(TicketStatus.OPEN)
                        .at(t.getCreatedAt())
                        .actor(admin)
                        .note("Ticket created")
                        .build());
            }
        };
    }
}
