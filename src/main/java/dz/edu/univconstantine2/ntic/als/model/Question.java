package dz.edu.univconstantine2.ntic.als.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;


@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "questions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Question extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    @JsonIgnoreProperties("questions")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Module module;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String statement;

    @Column(name = "options_json", columnDefinition = "TEXT", nullable = false)
    private String optionsJson;

    @Column(name = "correct_answer", nullable = false)
    private Integer correctAnswer;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = false)
    private DifficultyLevel difficultyLevel;

    private String category;

    @Builder.Default
    @Column(name = "times_answered")
    private Integer timesAnswered = 0;

    @Builder.Default
    @Column(name = "times_correct")
    private Integer timesCorrect = 0;

    @Builder.Default
    @Column(name = "discrimination_index")
    private Double discriminationIndex = 0.5;

    @Version
    private Long version;

    @Transient
    public Double getSuccessRate() {
        if (timesAnswered == null || timesAnswered == 0) {
            return 0.0;
        }
        return (double) timesCorrect / timesAnswered;
    }
}
