package dz.edu.univconstantine2.ntic.als.dto;

import dz.edu.univconstantine2.ntic.als.model.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {
    private String id;
    private String moduleId;
    private String statement;
    private List<String> options;
    private Integer correctAnswer;
    private DifficultyLevel difficultyLevel;
    private String category;
    private Integer timesAnswered;
    private Integer timesCorrect;
    private Double successRate;
    private Double discriminationIndex;
}
