package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.EnrollmentResponseDTO;
import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.dto.ModuleAccessDTO;
import dz.edu.univconstantine2.ntic.als.service.EnrollmentService;
import dz.edu.univconstantine2.ntic.als.service.ModuleAccessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final ModuleAccessService moduleAccessService;

    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<?> enroll(@PathVariable String courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.enroll(courseId, email));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Course not found."));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<List<EnrollmentResponseDTO>> getMyEnrollments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(email));
    }

    @PostMapping("/{enrollmentId}/complete-module")
    public ResponseEntity<?> completeModule(
            @PathVariable String enrollmentId,
            @RequestParam String moduleId,
            @RequestParam(required = false) Integer score,
            @RequestParam(required = false) Integer threshold) {
        try {
            return ResponseEntity.ok(enrollmentService.completeModule(enrollmentId, moduleId, score, threshold));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Enrollment not found."));
        }
    }

    /**
     * GET /api/enrollments/{enrollmentId}/access/{moduleId}
     * Returns whether the learner can access a given module (prerequisite check).
     * Task 8-K / FR-V02.
     */
    @GetMapping("/{enrollmentId}/access/{moduleId}")
    public ResponseEntity<ModuleAccessDTO> checkModuleAccess(
            @PathVariable String enrollmentId,
            @PathVariable String moduleId) {
        try {
            return ResponseEntity.ok(moduleAccessService.canAccess(enrollmentId, moduleId));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
