package dz.edu.univconstantine2.ntic.als.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dz.edu.univconstantine2.ntic.als.dto.AdaptiveAnswerResponseDTO;
import dz.edu.univconstantine2.ntic.als.dto.AdaptiveSessionStartDTO;
import dz.edu.univconstantine2.ntic.als.dto.QuestionResponseForLearner;
import dz.edu.univconstantine2.ntic.als.engine.AdaptiveEngine;
import dz.edu.univconstantine2.ntic.als.model.*;
import dz.edu.univconstantine2.ntic.als.repository.EnrollmentRepository;
import dz.edu.univconstantine2.ntic.als.repository.LearnerSessionRepository;
import dz.edu.univconstantine2.ntic.als.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Manages the lifecycle of adaptive quiz sessions (FR-V02, FR-V03).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdaptiveSessionService {

    private final AdaptiveEngine engine;
    private final LearnerSessionRepository sessionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    // ── Start Session ─────────────────────────────────────────────────────────

    /**
     * Starts a new adaptive session for the given enrollment + module.
     * Any existing IN_PROGRESS session for the same pair is abandoned first.
     */
    @Transactional
    public AdaptiveSessionStartDTO startSession(String enrollmentId, String moduleId) {

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new NoSuchElementException("Enrollment not found: " + enrollmentId));

        // Abandon any existing in-progress session
        sessionRepository
                .findByEnrollmentIdAndModuleIdAndStatus(enrollmentId, moduleId, SessionStatus.IN_PROGRESS)
                .ifPresent(existing -> {
                    existing.setStatus(SessionStatus.COMPLETED);
                    existing.setFinalScore(null);
                    sessionRepository.save(existing);
                    log.info("Abandoned previous session {} for enrollment {} module {}",
                            existing.getId(), enrollmentId, moduleId);
                });

        // Select first question at MEDIUM difficulty
        Question first = engine.selectNextQuestion(moduleId, DifficultyLevel.MEDIUM, Set.of())
                .orElseThrow(() -> new IllegalStateException(
                        "No questions available for module: " + moduleId));

        LearnerSession session = LearnerSession.builder()
                .enrollment(enrollment)
                .moduleId(moduleId)
                .currentDifficulty(DifficultyLevel.MEDIUM)
                .currentQuestionId(first.getId())
                .answeredQuestionIds("")
                .answerResults("")
                .status(SessionStatus.IN_PROGRESS)
                .build();

        session = sessionRepository.save(session);

        return new AdaptiveSessionStartDTO(
                session.getId(),
                toLearnerView(first),
                DifficultyLevel.MEDIUM,
                0,
                AdaptiveEngine.MAX_QUESTIONS
        );
    }

    // ── Submit Answer ─────────────────────────────────────────────────────────

    /**
     * Evaluates the learner's answer, updates session state, checks the
     * confidence threshold, and returns the next question or session summary.
     */
    @Transactional
    public AdaptiveAnswerResponseDTO submitAnswer(String sessionId,
                                                  String questionId,
                                                  int selectedAnswer) {

        LearnerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NoSuchElementException("Session not found: " + sessionId));

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new IllegalStateException("Session is already completed.");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new NoSuchElementException("Question not found: " + questionId));

        // Evaluate correctness
        boolean correct = question.getCorrectAnswer() != null
                && question.getCorrectAnswer() == selectedAnswer;

        // Update question statistics (@Modifying query from Phase 7)
        questionRepository.incrementStats(questionId, correct ? 1 : 0);

        // Update session answer log
        String answeredIds = appendCsv(session.getAnsweredQuestionIds(), questionId);
        String results     = appendCsv(session.getAnswerResults(), String.valueOf(correct));
        session.setAnsweredQuestionIds(answeredIds);
        session.setAnswerResults(results);

        // Parse answer history
        List<Boolean> history = parseAnswerResults(results);

        // Adjust difficulty
        DifficultyLevel newDifficulty = engine.adjustDifficulty(session.getCurrentDifficulty(), correct);
        session.setCurrentDifficulty(newDifficulty);

        // Check confidence threshold
        if (engine.hasReachedConfidenceThreshold(history)) {
            int score = engine.calculateFinalScore(history);
            session.setStatus(SessionStatus.COMPLETED);
            session.setFinalScore(score);
            session.setCurrentQuestionId(null);
            sessionRepository.save(session);

            return new AdaptiveAnswerResponseDTO(
                    null, newDifficulty, true, score, correct, history.size());
        }

        // Select next question (exclude already-answered ones)
        Set<String> excluded = parseCsvToSet(session.getAnsweredQuestionIds());
        Optional<Question> nextQ = engine.selectNextQuestion(session.getModuleId(), newDifficulty, excluded);

        if (nextQ.isEmpty()) {
            // No more questions — complete the session
            int score = engine.calculateFinalScore(history);
            session.setStatus(SessionStatus.COMPLETED);
            session.setFinalScore(score);
            session.setCurrentQuestionId(null);
            sessionRepository.save(session);

            return new AdaptiveAnswerResponseDTO(
                    null, newDifficulty, true, score, correct, history.size());
        }

        session.setCurrentQuestionId(nextQ.get().getId());
        sessionRepository.save(session);

        return new AdaptiveAnswerResponseDTO(
                toLearnerView(nextQ.get()),
                newDifficulty,
                false,
                null,
                correct,
                history.size()
        );
    }

    // ── Get Session ───────────────────────────────────────────────────────────

    public LearnerSession getSession(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NoSuchElementException("Session not found: " + sessionId));
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /** Safely map a Question to the learner-safe DTO (no correctAnswer). */
    private QuestionResponseForLearner toLearnerView(Question q) {
        List<String> options;
        try {
            options = objectMapper.readValue(q.getOptionsJson(), new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to parse options JSON for question {}: {}", q.getId(), e.getMessage());
            options = List.of();
        }
        return new QuestionResponseForLearner(
                q.getId(),
                q.getStatement(),
                options,
                q.getDifficultyLevel()
        );
    }

    private String appendCsv(String existing, String value) {
        if (existing == null || existing.isBlank()) return value;
        return existing + "," + value;
    }

    private List<Boolean> parseAnswerResults(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Boolean::parseBoolean)
                .toList();
    }

    private Set<String> parseCsvToSet(String csv) {
        if (csv == null || csv.isBlank()) return Set.of();
        return new HashSet<>(Arrays.asList(csv.split(",")));
    }
}
