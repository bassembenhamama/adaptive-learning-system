package dz.edu.univconstantine2.ntic.als.dto;

import dz.edu.univconstantine2.ntic.als.model.DifficultyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionCreateRequestDTO {
    @NotBlank(message = "Statement is required")
    private String statement;

    @NotEmpty(message = "Options cannot be empty")
    private List<String> options;

    @NotNull(message = "Correct answer index is required")
    private Integer correctAnswer;

    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficultyLevel;

    private String category;
}
