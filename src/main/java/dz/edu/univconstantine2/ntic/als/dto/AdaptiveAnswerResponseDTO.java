package dz.edu.univconstantine2.ntic.als.dto;

import dz.edu.univconstantine2.ntic.als.model.DifficultyLevel;

/**
 * Returned after the learner submits an answer.
 * nextQuestion is null when sessionComplete is true.
 * finalScore is null when sessionComplete is false.
 */
public record AdaptiveAnswerResponseDTO(
        QuestionResponseForLearner nextQuestion,
        DifficultyLevel newDifficulty,
        boolean sessionComplete,
        Integer finalScore,
        boolean lastAnswerCorrect,
        int questionsAnswered
) {}
