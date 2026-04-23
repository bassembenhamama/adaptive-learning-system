package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, String> {

    /** Returns all Q&A exchanges for a given (module, enrollment) pair, oldest first. */
    List<ChatHistory> findByModuleIdAndEnrollmentIdOrderByCreatedAtAsc(
            String moduleId, String enrollmentId);
}
