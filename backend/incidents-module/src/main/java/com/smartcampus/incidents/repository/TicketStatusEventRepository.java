package com.smartcampus.incidents.repository;

import com.smartcampus.incidents.model.TicketStatusEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketStatusEventRepository extends JpaRepository<TicketStatusEvent, Long> {
}
