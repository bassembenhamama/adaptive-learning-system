package dz.edu.univconstantine2.ntic.als.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body sent by the learner when answering a question.
 */
public record AdaptiveAnswerRequestDTO(
        @NotBlank String questionId,
        @NotNull Integer selectedAnswer
) {}
