package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, String> {

    @Query("SELECT c FROM Course c WHERE c.id = :id")
    @EntityGraph(attributePaths = {"modules", "instructor"})
    Optional<Course> findByIdWithModulesAndInstructor(@Param("id") String id);

    @Query("SELECT c FROM Course c WHERE c.instructor = :instructor")
    @EntityGraph(attributePaths = {"modules", "instructor"})
    List<Course> findByInstructorWithModules(@Param("instructor") User instructor);

    @Query("SELECT c FROM Course c WHERE (c.deleted = FALSE OR c.deleted IS NULL)")
    @EntityGraph(attributePaths = {"instructor"})
    List<Course> findAllActive();
    
    // Existing method just in case
    List<Course> findByInstructor(User instructor);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE courses SET instructor_id = NULL, updated_at = NOW() WHERE instructor_id = :instructorId", nativeQuery = true)
    void nullifyInstructor(@Param("instructorId") Long instructorId);
}
