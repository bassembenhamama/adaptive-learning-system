package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.LearnerSession;
import dz.edu.univconstantine2.ntic.als.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearnerSessionRepository extends JpaRepository<LearnerSession, String> {

    /**
     * Find the most recently active (or completed) session for a given
     * enrollment+module combination and status.
     */
    Optional<LearnerSession> findByEnrollmentIdAndModuleIdAndStatus(
            String enrollmentId,
            String moduleId,
            SessionStatus status);
}
