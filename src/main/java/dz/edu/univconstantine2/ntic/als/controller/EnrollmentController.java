package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentController(EnrollmentRepository enrollmentRepository,
                                CourseRepository courseRepository,
                                UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<?> enroll(@PathVariable String courseId) {
        User user = getAuthenticatedUser();
        Course course = courseRepository.findById(courseId).orElse(null);

        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        }

        if (enrollmentRepository.findByUserAndCourse(user, course).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, "You are already enrolled in this course."));
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setCompletedModuleIds("");
        enrollment.setScore(0);

        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentRepository.save(enrollment));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Enrollment>> getMyEnrollments() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(enrollmentRepository.findByUser(user));
    }

    @PostMapping("/{enrollmentId}/complete-module")
    public ResponseEntity<?> completeModule(
            @PathVariable String enrollmentId,
            @RequestParam String moduleId,
            @RequestParam(required = false) Integer score,
            @RequestParam(required = false) Integer threshold) {

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId).orElse(null);
        if (enrollment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Enrollment not found."));
        }

        boolean passed = true;
        if (score != null && threshold != null) {
            passed = score >= threshold;
        }

        if (passed) {
            String completed = enrollment.getCompletedModuleIds();
            if (completed == null) completed = "";
            if (!completed.contains(moduleId)) {
                completed = completed.isEmpty() ? moduleId : completed + "," + moduleId;
                enrollment.setCompletedModuleIds(completed);
            }
        }

        enrollmentRepository.save(enrollment);
        return ResponseEntity.ok(enrollment);
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
