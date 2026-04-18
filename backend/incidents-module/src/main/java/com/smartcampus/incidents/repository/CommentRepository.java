package com.smartcampus.incidents.repository;

import com.smartcampus.incidents.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicket_IdOrderByCreatedAtAsc(Long ticketId);

    Optional<Comment> findByIdAndAuthor_Id(Long id, Long authorId);
}
