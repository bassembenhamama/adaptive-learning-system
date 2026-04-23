package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.CourseAnalyticsDTO;
import dz.edu.univconstantine2.ntic.als.dto.ModuleAnalyticsDTO;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class InstructorService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ModuleRepository moduleRepository;

    /**
     * Returns cohort analytics for a specific course.
     * Enforces IDOR protection: the requesting instructor must own the course.
     *
     * @param courseId        the course UUID
     * @param instructorEmail the authenticated user's email
     * @return CourseAnalyticsDTO with per-module breakdown
     * @throws NoSuchElementException if the course does not exist
     * @throws AccessDeniedException  if the caller does not own the course
     */
    @Transactional(readOnly = true)
    public CourseAnalyticsDTO getCourseAnalytics(String courseId, String instructorEmail, boolean isAdmin) {
        Course course = courseRepository.findByIdWithModulesAndInstructor(courseId)
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + courseId));

        // IDOR check — admins bypass; instructors must own the course
        if (!isAdmin) {
            boolean isOwner = course.getInstructor() != null
                    && course.getInstructor().getEmail().equals(instructorEmail);
            if (!isOwner) {
                log.warn("Access denied: {} attempted to view analytics for course {}", instructorEmail, courseId);
                throw new AccessDeniedException("You do not own this course.");
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseActive(course);
        long totalEnrollments = enrollments.size();

        double overallAvg = totalEnrollments == 0 ? 0.0
                : enrollments.stream().mapToInt(Enrollment::getScore).average().orElse(0.0);

        List<Module> modules = moduleRepository.findByCourseAndDeletedFalseOrderByDisplayOrderAsc(course);
        List<ModuleAnalyticsDTO> moduleAnalytics = new ArrayList<>();

        for (Module module : modules) {
            String moduleId = module.getId();

            // Learners who have completed this module (moduleId present in comma-separated list)
            List<Enrollment> completedByModule = enrollments.stream()
                    .filter(e -> e.getCompletedModuleIds() != null
                            && Arrays.asList(e.getCompletedModuleIds().split(",")).contains(moduleId))
                    .toList();

            long moduleEnrollments = completedByModule.size();

            double moduleAvgScore = moduleEnrollments == 0 ? 0.0
                    : completedByModule.stream().mapToInt(Enrollment::getScore).average().orElse(0.0);

            int threshold = module.getThreshold() != null ? module.getThreshold() : 70;
            long failCount = completedByModule.stream()
                    .filter(e -> e.getScore() < threshold)
                    .count();

            moduleAnalytics.add(new ModuleAnalyticsDTO(
                    moduleId,
                    module.getTitle(),
                    moduleEnrollments,
                    Math.round(moduleAvgScore * 10.0) / 10.0,
                    failCount
            ));
        }

        return new CourseAnalyticsDTO(
                course.getId(),
                course.getTitle(),
                totalEnrollments,
                Math.round(overallAvg * 10.0) / 10.0,
                moduleAnalytics
        );
    }
}
