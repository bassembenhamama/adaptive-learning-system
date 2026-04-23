package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.MasteryState;
import dz.edu.univconstantine2.ntic.als.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    List<Enrollment> findByUser(User user);
    Optional<Enrollment> findByUserAndCourse(User user, Course course);

    @Query("SELECT e FROM Enrollment e WHERE e.user = :user AND (e.deleted = FALSE OR e.deleted IS NULL) AND (e.course.deleted = FALSE OR e.course.deleted IS NULL)")
    @EntityGraph(attributePaths = {"course", "course.modules"})
    List<Enrollment> findByUserWithCourseAndModules(@Param("user") User user);

    /**
     * Returns all active (non-deleted) enrollments for a given course.
     * Used by InstructorService to compute cohort analytics.
     */
    @Query("SELECT e FROM Enrollment e WHERE e.course = :course AND (e.deleted = FALSE OR e.deleted IS NULL)")
    List<Enrollment> findByCourseActive(@Param("course") Course course);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE enrollments SET deleted = TRUE, updated_at = NOW() WHERE course_id = :courseId AND (deleted = FALSE OR deleted IS NULL)", nativeQuery = true)
    void softDeleteByCourseId(@Param("courseId") String courseId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE enrollments SET deleted = TRUE, updated_at = NOW() WHERE user_id = :userId AND (deleted = FALSE OR deleted IS NULL)", nativeQuery = true)
    void softDeleteByUserId(@Param("userId") Long userId);

    // Task 4-B — used by AdminController to compute admin stats without loading entities
    long countByMasteryState(MasteryState masteryState);
}
