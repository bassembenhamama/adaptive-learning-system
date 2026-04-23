package dz.edu.univconstantine2.ntic.als.repository;

import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, String> {
    List<Module> findByCourseOrderByDisplayOrderAsc(Course course);

    /**
     * Returns only non-deleted modules for a course, ordered by display order.
     * Used by InstructorService for cohort analytics.
     */
    List<Module> findByCourseAndDeletedFalseOrderByDisplayOrderAsc(Course course);

    /**
     * Returns all non-deleted modules for a given course ID, ordered by display order.
     * Used by ModuleAccessService for prerequisite-chain gating (Phase 8).
     */
    List<Module> findByCourseIdAndDeletedFalseOrderByDisplayOrderAsc(String courseId);
}
