package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    /** Existing — for chat history overlay */
    List<Message> findByModuleIdAndEnrollmentIdOrderByCreatedAtAsc(String moduleId, String enrollmentId);

    /**
     * Task 12-G — RecommendationService needs the N most recent messages across
     * all of a user's enrollments so it can analyse chat topics.
     *
     * Pass {@code PageRequest.of(0, limit)} as the {@code pageable} argument.
     *
     * @param enrollmentIds all enrollment IDs belonging to the user
     * @param pageable      use {@code PageRequest.of(0, n)} to control the limit
     */
    @Query(value = """
            SELECT * FROM messages
            WHERE enrollment_id IN (:enrollmentIds)
            ORDER BY created_at DESC
            """, nativeQuery = true)
    List<Message> findRecentByEnrollmentIds(@Param("enrollmentIds") Set<String> enrollmentIds,
                                            Pageable pageable);
}
