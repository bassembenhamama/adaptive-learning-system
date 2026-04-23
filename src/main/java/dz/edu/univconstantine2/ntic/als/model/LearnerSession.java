package dz.edu.univconstantine2.ntic.als.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "learner_sessions", indexes = {
        @Index(name = "idx_ls_enrollment_module_status",
               columnList = "enrollment_id, module_id, status")
})
public class LearnerSession extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /** The enrollment this session belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Enrollment enrollment;

    /** The module being practised. */
    @Column(name = "module_id", nullable = false)
    private String moduleId;

    /** Current difficulty the engine is operating at. */
    @Enumerated(EnumType.STRING)
    @Column(name = "current_difficulty", nullable = false)
    private DifficultyLevel currentDifficulty;

    /**
     * Comma-separated list of question IDs already served in this session,
     * used to avoid repetition.
     */
    @Column(name = "answered_question_ids", length = 5000)
    @Builder.Default
    private String answeredQuestionIds = "";

    /**
     * Comma-separated "true"/"false" values — one per answered question —
     * used by the confidence-threshold and score calculations.
     */
    @Column(name = "answer_results", length = 5000)
    @Builder.Default
    private String answerResults = "";

    /** The question ID currently presented to the learner (null when session is complete). */
    @Column(name = "current_question_id")
    private String currentQuestionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    /** Percentage score (0-100), set only when status = COMPLETED. */
    @Column(name = "final_score")
    private Integer finalScore;
}
