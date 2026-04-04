package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    List<Enrollment> findByUser(User user);
    Optional<Enrollment> findByUserAndCourse(User user, Course course);
}
