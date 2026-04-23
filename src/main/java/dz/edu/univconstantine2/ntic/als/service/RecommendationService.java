package dz.edu.univconstantine2.ntic.als.service;

import dz.edu.univconstantine2.ntic.als.dto.CourseResponseDTO;
import dz.edu.univconstantine2.ntic.als.dto.DtoMapper;
import dz.edu.univconstantine2.ntic.als.model.Course;
import dz.edu.univconstantine2.ntic.als.model.Enrollment;
import dz.edu.univconstantine2.ntic.als.model.Message;
import dz.edu.univconstantine2.ntic.als.model.User;
import dz.edu.univconstantine2.ntic.als.repository.CourseRepository;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.MessageRepository;
import dz.edu.univconstantine2.ntic.als.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * FR-V07 — Dynamic Recommendations.
 *
 * Algorithm:
 * 1. Load the user and their enrollments.
 * 2. Collect the 20 most recent Message entities across all enrollments.
 * 3. If no messages, return empty (nothing to recommend from).
 * 4. Join all user query strings and ask the LLM for 5 topic keywords.
 * 5. Split keywords by comma, sanitise (trim, length ≥ 3).
 * 6. For each keyword, search courses by title or category (case-insensitive).
 * 7. Exclude already-enrolled courses. Collect unique matches up to 3.
 * 8. Return as List<CourseResponseDTO>.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private static final int MAX_RECENT_MESSAGES = 20;
    private static final int MAX_RECOMMENDATIONS = 3;

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final MessageRepository messageRepository;
    private final CourseRepository courseRepository;
    private final LLMService llmService;

    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getRecommendations(String userEmail) {
        // Step 1 — load user
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        // Step 2 — collect enrollment IDs
        List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
        if (enrollments.isEmpty()) {
            return Collections.emptyList();
        }
        Set<String> enrollmentIds = enrollments.stream()
                .map(Enrollment::getId)
                .collect(Collectors.toSet());
        Set<String> enrolledCourseIds = enrollments.stream()
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toSet());

        // Step 3 — fetch recent messages
        List<Message> recentMessages = messageRepository.findRecentByEnrollmentIds(
                enrollmentIds, PageRequest.of(0, MAX_RECENT_MESSAGES));
        if (recentMessages.isEmpty()) {
            log.debug("[Recommendations] No messages found for user {}", userEmail);
            return Collections.emptyList();
        }

        // Step 4 — build combined query text and ask LLM for keywords
        String combinedQueries = recentMessages.stream()
                .map(Message::getUserQuery)
                .collect(Collectors.joining(" | "));

        List<String> keywords = extractKeywords(combinedQueries);
        if (keywords.isEmpty()) {
            log.debug("[Recommendations] LLM returned no usable keywords for user {}", userEmail);
            return Collections.emptyList();
        }

        log.info("[Recommendations] Keywords for {}: {}", userEmail, keywords);

        // Step 5–7 — search courses, exclude enrolled, collect up to MAX_RECOMMENDATIONS unique results
        List<Course> allCourses = courseRepository.findAllActive();
        LinkedHashSet<Course> matches = new LinkedHashSet<>();

        for (String keyword : keywords) {
            if (matches.size() >= MAX_RECOMMENDATIONS) break;
            String kw = keyword.toLowerCase();
            for (Course c : allCourses) {
                if (matches.size() >= MAX_RECOMMENDATIONS) break;
                if (enrolledCourseIds.contains(c.getId())) continue;
                boolean titleMatch = c.getTitle() != null && c.getTitle().toLowerCase().contains(kw);
                boolean categoryMatch = c.getCategory() != null && c.getCategory().toLowerCase().contains(kw);
                if (titleMatch || categoryMatch) {
                    matches.add(c);
                }
            }
        }

        return matches.stream()
                .map(DtoMapper::toCourseDTO)
                .collect(Collectors.toList());
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private List<String> extractKeywords(String combinedQueries) {
        try {
            String prompt = String.format(
                    "Analyse the following student questions and return EXACTLY 5 educational topic keywords " +
                    "as a single comma-separated list with no explanations, no numbering, no extra text.\n\n" +
                    "Student questions:\n%s",
                    combinedQueries.length() > 3000
                            ? combinedQueries.substring(0, 3000) + "..."
                            : combinedQueries);

            String raw = llmService.generateResponse(prompt, "", "", Collections.emptyList());

            boolean isError = raw == null
                    || raw.startsWith("AI Tutoring is currently not configured")
                    || raw.startsWith("An error occurred")
                    || raw.startsWith("I'm having trouble");

            if (isError) return Collections.emptyList();

            return Arrays.stream(raw.split(","))
                    .map(String::trim)
                    // remove markdown bullets / numbers the LLM may have added
                    .map(k -> k.replaceAll("^[\\d.*\\-]+\\s*", ""))
                    .filter(k -> k.length() >= 3)
                    .limit(5)
                    .collect(Collectors.toList());

        } catch (Exception ex) {
            log.warn("[Recommendations] LLM keyword extraction failed: {}", ex.getMessage());
            return Collections.emptyList();
        }
    }
}
