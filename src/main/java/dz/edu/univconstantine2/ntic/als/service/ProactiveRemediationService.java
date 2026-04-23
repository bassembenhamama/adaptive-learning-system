package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.event.RemediationNeededEvent;
import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.Module;
import dz.edu.univconstantine2.ntic.als.model.Notification;
import dz.edu.univconstantine2.ntic.als.model.NotificationType;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.ModuleRepository;
import dz.edu.univconstantine2.ntic.als.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * FR-V06 — Proactive Remediation.
 *
 * Listens for {@link RemediationNeededEvent} (published by EnrollmentService when
 * a learner's score falls below the module threshold). Calls the LLM to generate
 * a personalised 150-word Socratic explanation and persists a REMEDIATION
 * {@link Notification} that the frontend polls every 60 seconds.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProactiveRemediationService {

    private static final String STATIC_FALLBACK =
            "You seem to be struggling with this module. Please review the module materials " +
            "carefully and consider asking your instructor for additional guidance.";

    private final EnrollmentRepository enrollmentRepository;
    private final ModuleRepository moduleRepository;
    private final NotificationRepository notificationRepository;
    private final LLMService llmService;

    /**
     * Async so it does not block the quiz-submit HTTP thread.
     * All exceptions are caught — a failure here must never roll back the quiz result.
     */
    @Async
    @EventListener
    public void handleRemediationNeeded(RemediationNeededEvent event) {
        log.info("[Remediation] Event received — enrollmentId={}, moduleId={}, score={}",
                event.enrollmentId(), event.moduleId(), event.score());
        try {
            // 1. Load enrollment
            Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(event.enrollmentId());
            if (enrollmentOpt.isEmpty()) {
                log.warn("[Remediation] Enrollment {} not found — aborting", event.enrollmentId());
                return;
            }
            Enrollment enrollment = enrollmentOpt.get();
            Long userId = enrollment.getUser().getId();
            String courseTitle = enrollment.getCourse().getTitle();

            // 2. Load module
            Optional<Module> moduleOpt = moduleRepository.findById(event.moduleId());
            String moduleTitle = moduleOpt.map(Module::getTitle).orElse("the module");

            // 3. Build prompt & call LLM (no RAG context — general explanation)
            String aiContent = generateRemediationContent(courseTitle, moduleTitle);

            // 4. Format notification body
            String notificationContent = formatContent(moduleTitle, aiContent);

            // 5. Persist notification
            Notification notification = Notification.create(
                    userId,
                    event.enrollmentId(),
                    event.moduleId(),
                    moduleTitle,
                    notificationContent,
                    NotificationType.REMEDIATION
            );
            notificationRepository.save(notification);
            log.info("[Remediation] Notification saved for userId={}, moduleId={}", userId, event.moduleId());

        } catch (Exception ex) {
            log.error("[Remediation] Failed to process remediation event for enrollmentId={}: {}",
                    event.enrollmentId(), ex.getMessage(), ex);
            // Intentionally swallowed — quiz result is already committed
        }
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private String generateRemediationContent(String courseTitle, String moduleTitle) {
        try {
            String prompt = String.format(
                    "A student is struggling with the module '%s' in the course '%s'. " +
                    "Write a concise, friendly, Socratic explanation (maximum 150 words) that " +
                    "helps them understand the core concept of this topic. " +
                    "Guide them with a question at the end to encourage reflection. " +
                    "Use plain Markdown formatting.",
                    moduleTitle, courseTitle);

            // Pass empty context chunks — this is a general explanation, not RAG-grounded
            String response = llmService.generateResponse(prompt, courseTitle, moduleTitle, List.of());

            boolean isAiUnavailable = response != null && (
                    response.startsWith("AI Tutoring is currently not configured") ||
                    response.startsWith("An error occurred"));

            if (isAiUnavailable) {
                return STATIC_FALLBACK;
            }
            return response != null ? response : STATIC_FALLBACK;

        } catch (Exception ex) {
            log.warn("[Remediation] LLM call failed, using static fallback: {}", ex.getMessage());
            return STATIC_FALLBACK;
        }
    }

    private String formatContent(String moduleTitle, String aiSummary) {
        return "## 📚 Struggling with \"" + moduleTitle + "\"?\n\n" +
               "Our AI tutor has prepared a quick refresher for you:\n\n" +
               aiSummary;
    }
}
