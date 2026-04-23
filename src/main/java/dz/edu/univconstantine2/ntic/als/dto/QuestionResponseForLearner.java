package dz.edu.univconstantine2.ntic.als.dto;

import dz.edu.univconstantine2.ntic.als.model.DifficultyLevel;

import java.util.List;

/**
 * Learner-safe question view — correctAnswer is intentionally omitted (FR-V03 security).
 */
public record QuestionResponseForLearner(
        String id,
        String statement,
        List<String> options,
        DifficultyLevel difficultyLevel
) {}
