package dz.edu.univconstantine2.ntic.als.controller;

import dz.edu.univconstantine2.ntic.als.dto.AdaptiveAnswerRequestDTO;
import dz.edu.univconstantine2.ntic.als.dto.AdaptiveAnswerResponseDTO;
import dz.edu.univconstantine2.ntic.als.dto.AdaptiveSessionStartDTO;
import dz.edu.univconstantine2.ntic.als.dto.AdaptiveStartRequestDTO;
import dz.edu.univconstantine2.ntic.als.model.LearnerSession;
import dz.edu.univconstantine2.ntic.als.service.AdaptiveSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

/**
 * REST controller for the Adaptive Engine (FR-V01 / FR-V02 / FR-V03).
 * All endpoints require LEARNER role (enforced via SecurityConfig).
 */
@Slf4j
@RestController
@RequestMapping("/api/adaptive")
@RequiredArgsConstructor
public class AdaptiveController {

    private final AdaptiveSessionService sessionService;

    /**
     * POST /api/adaptive/sessions/start
     * Starts a new adaptive session; abandons any existing IN_PROGRESS session
     * for the same enrollment+module pair.
     */
    @PostMapping("/sessions/start")
    public ResponseEntity<?> startSession(@Valid @RequestBody AdaptiveStartRequestDTO request) {
        try {
            AdaptiveSessionStartDTO dto = sessionService.startSession(
                    request.enrollmentId(), request.moduleId());
            return ResponseEntity.ok(dto);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * POST /api/adaptive/sessions/{sessionId}/answer
     * Submits the learner's answer; returns next question or session summary.
     */
    @PostMapping("/sessions/{sessionId}/answer")
    public ResponseEntity<?> submitAnswer(
            @PathVariable String sessionId,
            @Valid @RequestBody AdaptiveAnswerRequestDTO request) {
        try {
            AdaptiveAnswerResponseDTO response = sessionService.submitAnswer(
                    sessionId, request.questionId(), request.selectedAnswer());
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * GET /api/adaptive/sessions/{sessionId}
     * Returns current session state (status, difficulty, questions answered, etc.).
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable String sessionId) {
        try {
            LearnerSession session = sessionService.getSession(sessionId);
            return ResponseEntity.ok(session);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
