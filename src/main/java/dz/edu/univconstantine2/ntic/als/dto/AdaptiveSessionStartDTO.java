package dz.edu.univconstantine2.ntic.als.dto;

import dz.edu.univconstantine2.ntic.als.model.DifficultyLevel;

/**
 * Returned when a new adaptive session is started.
 */
public record AdaptiveSessionStartDTO(
        String sessionId,
        QuestionResponseForLearner firstQuestion,
        DifficultyLevel currentDifficulty,
        int questionsAnswered,
        int estimatedTotal
) {}
