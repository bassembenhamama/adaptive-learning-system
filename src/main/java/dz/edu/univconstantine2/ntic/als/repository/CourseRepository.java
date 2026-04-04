package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findByInstructor(User instructor);
}
