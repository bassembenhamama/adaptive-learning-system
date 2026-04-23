package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.DtoMapper;
import dz.edu.univconstantine2.ntic.als.dto.EnrollmentResponseDTO;
import dz.edu.univconstantine2.ntic.als.event.QuizCompletedEvent;
import dz.edu.univconstantine2.ntic.als.event.RemediationNeededEvent;
import dz.edu.univconstantine2.ntic.als.event.UserEnrolledEvent;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.MasteryState;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<EnrollmentResponseDTO> getMyEnrollments(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return enrollmentRepository.findByUserWithCourseAndModules(user).stream()
                .map(DtoMapper::toEnrollmentDTO).toList();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public EnrollmentResponseDTO enroll(String courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NoSuchElementException("Course not found"));

        if (enrollmentRepository.findByUserAndCourse(user, course).isPresent()) {
            throw new IllegalStateException("Already enrolled in this course.");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user).course(course).completedModuleIds("").score(0)
                .masteryState(MasteryState.IN_PROGRESS).build();

        Enrollment saved = enrollmentRepository.save(enrollment);

        // Publish event asynchronously (email, analytics)
        eventPublisher.publishEvent(new UserEnrolledEvent(saved.getId()));

        log.info("User {} enrolled in course {}", userEmail, courseId);
        return DtoMapper.toEnrollmentDTO(saved);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public EnrollmentResponseDTO completeModule(String enrollmentId, String moduleId, Integer score, Integer threshold) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new NoSuchElementException("Enrollment not found"));

        boolean passed = (score == null || threshold == null) || score >= threshold;

        if (passed) {
            String current = enrollment.getCompletedModuleIds();
            if (current == null) current = "";
            if (!current.contains(moduleId)) {
                enrollment.setCompletedModuleIds(
                        current.isEmpty() ? moduleId : current + "," + moduleId);
            }
        }

        // Recalculate mastery state
        long totalModules = enrollment.getCourse().getModules().size();
        long completedCount = Arrays.stream(
                enrollment.getCompletedModuleIds().split(","))
                .filter(s -> !s.isBlank()).count();

        double completionRatio = totalModules > 0 ? (double) completedCount / totalModules : 0;

        if (completionRatio >= 0.8) {
            enrollment.setMasteryState(MasteryState.MASTERED);
        } else if (score != null && threshold != null && score < threshold) {
            enrollment.setMasteryState(MasteryState.NEEDS_REMEDIATION);
            // Trigger proactive remediation event
            eventPublisher.publishEvent(new RemediationNeededEvent(enrollmentId, moduleId, score));
        }

        Enrollment saved = enrollmentRepository.save(enrollment);

        // Publish QuizCompletedEvent whenever a quiz score is provided
        if (score != null && threshold != null) {
            eventPublisher.publishEvent(
                new QuizCompletedEvent(enrollmentId, moduleId, score, threshold, saved.getMasteryState()));
        }

        return DtoMapper.toEnrollmentDTO(saved);
    }
}
