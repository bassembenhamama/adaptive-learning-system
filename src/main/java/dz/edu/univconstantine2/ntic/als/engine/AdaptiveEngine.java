package dz.edu.univconstantine2.ntic.als.engine;

import dz.edu.univconstantine2.ntic.als.model.DifficultyLevel;
import dz.edu.univconstantine2.ntic.als.model.Question;
import dz.edu.univconstantine2.ntic.als.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Core adaptive-engine logic (FR-V01, FR-V02, FR-V03).
 *
 * All constants are package-visible so {@link AdaptiveSessionService} can
 * expose {@code estimatedTotal} without duplicating the magic number.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdaptiveEngine {

    // ── Constants ────────────────────────────────────────────────────────────

    /** Minimum questions that must be answered before a threshold check. */
    static final int MIN_QUESTIONS = 5;

    /**
     * Size of the trailing window: if the last N answers are ALL correct or
     * ALL wrong the engine considers the learner's level stable.
     */
    static final int WINDOW_SIZE = 3;

    /** Hard cap on questions per session regardless of confidence. */
    public static final int MAX_QUESTIONS = 15;

    // ── Dependencies ─────────────────────────────────────────────────────────

    private final QuestionRepository questionRepository;

    // ── FR-V01: Difficulty Adjustment ────────────────────────────────────────

    /**
     * Returns the next difficulty level after a response.
     * <ul>
     *   <li>Correct → step UP one level (capped at HARD)</li>
     *   <li>Wrong   → step DOWN one level (floored at EASY)</li>
     * </ul>
     */
    public DifficultyLevel adjustDifficulty(DifficultyLevel current, boolean wasCorrect) {
        return switch (current) {
            case EASY   -> wasCorrect ? DifficultyLevel.MEDIUM : DifficultyLevel.EASY;
            case MEDIUM -> wasCorrect ? DifficultyLevel.HARD   : DifficultyLevel.EASY;
            case HARD   -> wasCorrect ? DifficultyLevel.HARD   : DifficultyLevel.MEDIUM;
        };
    }

    // ── FR-V02: Dynamic Module Routing (question selection) ──────────────────

    /**
     * Selects a single random, unseen question at the requested difficulty.
     * Falls back to the adjacent lower difficulty if no questions are available
     * at the requested level.
     *
     * @param moduleId    the module from which to draw questions
     * @param difficulty  target difficulty
     * @param excludedIds question IDs already answered in this session
     * @return an Optional containing the next question, or empty if the module
     *         has no remaining questions at any reachable difficulty
     */
    public Optional<Question> selectNextQuestion(String moduleId,
                                                 DifficultyLevel difficulty,
                                                 Set<String> excludedIds) {

        Optional<Question> chosen = pickOne(moduleId, difficulty, excludedIds);
        if (chosen.isPresent()) {
            return chosen;
        }

        // Fallback: try one level lower
        DifficultyLevel fallback = oneLevelDown(difficulty);
        if (fallback != difficulty) {
            log.debug("No questions at {} for module {}, falling back to {}",
                    difficulty, moduleId, fallback);
            return pickOne(moduleId, fallback, excludedIds);
        }

        return Optional.empty();
    }

    // ── FR-V03: Confidence Threshold ─────────────────────────────────────────

    /**
     * Returns {@code true} when the session should end:
     * <ul>
     *   <li>MAX_QUESTIONS reached, OR</li>
     *   <li>MIN_QUESTIONS answered AND the last WINDOW_SIZE answers are
     *       uniformly correct or uniformly wrong (stable performance).</li>
     * </ul>
     */
    public boolean hasReachedConfidenceThreshold(List<Boolean> answers) {
        int n = answers.size();

        if (n >= MAX_QUESTIONS) {
            return true;
        }

        if (n < MIN_QUESTIONS) {
            return false;
        }

        // Inspect the trailing window
        List<Boolean> window = answers.subList(n - WINDOW_SIZE, n);
        boolean allCorrect = window.stream().allMatch(Boolean::booleanValue);
        boolean allWrong   = window.stream().noneMatch(Boolean::booleanValue);

        return allCorrect || allWrong;
    }

    // ── Score Calculation ─────────────────────────────────────────────────────

    /**
     * Calculates percentage of correct answers, rounded to nearest integer.
     */
    public int calculateFinalScore(List<Boolean> answers) {
        if (answers.isEmpty()) return 0;
        long correct = answers.stream().filter(Boolean::booleanValue).count();
        return (int) Math.round((correct * 100.0) / answers.size());
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private Optional<Question> pickOne(String moduleId,
                                       DifficultyLevel difficulty,
                                       Set<String> excludedIds) {
        List<Question> candidates;
        if (excludedIds.isEmpty()) {
            candidates = questionRepository.findRandomQuestions(
                    moduleId, difficulty, PageRequest.of(0, 1));
        } else {
            candidates = questionRepository.findRandomQuestions(
                    moduleId, difficulty,
                    List.copyOf(excludedIds),
                    PageRequest.of(0, 1));
        }
        return candidates.stream().findFirst();
    }

    private DifficultyLevel oneLevelDown(DifficultyLevel d) {
        return switch (d) {
            case HARD   -> DifficultyLevel.MEDIUM;
            case MEDIUM -> DifficultyLevel.EASY;
            case EASY   -> DifficultyLevel.EASY;
        };
    }
}
