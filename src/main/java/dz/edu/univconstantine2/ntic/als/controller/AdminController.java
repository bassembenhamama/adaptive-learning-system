package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.AdminStatsDTO;
import dz.edu.univconstantine2.ntic.als.dto.ErrorResponse;
import dz.edu.univconstantine2.ntic.als.dto.UserResponseDTO;
import dz.edu.univconstantine2.ntic.als.model.MasteryState;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import dz.edu.univconstantine2.ntic.als.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Task 4-A / 4-B / 4-C — AdminController with pagination + stats.
 *
 * GET  /api/admin/users?page=0&size=20&sort=name,asc → Page<UserResponseDTO>
 * GET  /api/admin/stats                               → AdminStatsDTO
 * PUT  /api/admin/users/{userId}/role                 → UserResponseDTO
 * DELETE /api/admin/users/{userId}                    → 204
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;

    /**
     * Task 4-A — paginated user list.
     * Supports URL params: page (default 0), size (default 20), sort.
     */
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {

        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        return ResponseEntity.ok(userService.getAllUsersPaged(pageable));
    }

    /**
     * Task 4-B / 4-C — admin dashboard stats.
     * All five values computed from count queries — no entities loaded into memory.
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        long totalUsers       = userService.countUsers();
        long totalCourses     = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long mastered         = enrollmentRepository.countByMasteryState(MasteryState.MASTERED);
        long totalModules     = moduleRepository.count();

        return ResponseEntity.ok(new AdminStatsDTO(
                totalUsers, totalCourses, totalEnrollments, mastered, totalModules
        ));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Role is required."));
        }

        try {
            return ResponseEntity.ok(userService.updateUserRole(userId, newRole));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "User not found."));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "User not found."));
        }
    }
}
