package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, String> {
    List<Module> findByCourseOrderByDisplayOrderAsc(Course course);
}
