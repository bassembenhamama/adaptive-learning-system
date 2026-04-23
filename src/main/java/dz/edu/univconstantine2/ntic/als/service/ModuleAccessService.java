package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.ModuleAccessDTO;
import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.MasteryState;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Implements prerequisite-chain gating (FR-V02).
 *
 * Rule: modules are ordered by {@link Module#getDisplayOrder()}.
 * <ul>
 *   <li>Module with the lowest displayOrder is always accessible.</li>
 *   <li>Module N requires module N-1 to appear in {@code completedModuleIds}.</li>
 *   <li>If the enrollment is in {@link MasteryState#NEEDS_REMEDIATION} and the
 *       prerequisite is not yet complete, the reason explicitly mentions the AI Tutor.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModuleAccessService {

    private final EnrollmentRepository enrollmentRepository;
    private final ModuleRepository moduleRepository;

    public ModuleAccessDTO canAccess(String enrollmentId, String moduleId) {

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new NoSuchElementException("Enrollment not found: " + enrollmentId));

        // Load all non-deleted modules ordered by displayOrder ascending
        String courseId = enrollment.getCourse().getId();
        List<Module> modules = moduleRepository
                .findByCourseIdAndDeletedFalseOrderByDisplayOrderAsc(courseId);

        if (modules.isEmpty()) {
            return new ModuleAccessDTO(false, "Course has no modules.");
        }

        // Find the requested module's position
        int targetIndex = -1;
        for (int i = 0; i < modules.size(); i++) {
            if (modules.get(i).getId().equals(moduleId)) {
                targetIndex = i;
                break;
            }
        }

        if (targetIndex == -1) {
            return new ModuleAccessDTO(false, "Module not found in this course.");
        }

        // First module (lowest displayOrder) is always accessible
        if (targetIndex == 0) {
            return new ModuleAccessDTO(true, "First module is always accessible.");
        }

        // Check whether the predecessor is completed
        Module predecessor = modules.get(targetIndex - 1);
        Set<String> completedIds = parseCsv(enrollment.getCompletedModuleIds());
        boolean prerequisiteDone = completedIds.contains(predecessor.getId());

        if (prerequisiteDone) {
            return new ModuleAccessDTO(true, "Prerequisite module completed.");
        }

        // Prerequisite not complete — build an appropriate reason message
        String reason;
        if (enrollment.getMasteryState() == MasteryState.NEEDS_REMEDIATION) {
            reason = String.format(
                    "You must complete \"%s\" first. Your mastery state suggests you may need extra practice — " +
                    "consider using the AI Tutor to strengthen your understanding before moving on.",
                    predecessor.getTitle());
        } else {
            reason = String.format(
                    "You must complete \"%s\" before accessing this module.",
                    predecessor.getTitle());
        }

        return new ModuleAccessDTO(false, reason);
    }

    private Set<String> parseCsv(String csv) {
        if (csv == null || csv.isBlank()) return Set.of();
        return new HashSet<>(Arrays.asList(csv.split(",")));
    }
}
