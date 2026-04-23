package dz.edu.univconstantine2.ntic.als.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Data
@EqualsAndHashCode(callSuper=true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "enrollments")
@SQLDelete(sql = "UPDATE enrollments SET deleted = TRUE WHERE id = ?")
@SQLRestriction("deleted = FALSE OR deleted IS NULL")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Enrollment extends Auditable {

    @Column(name = "deleted")
    @Builder.Default
    private Boolean deleted = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "mastery_state", nullable = false)
    @Builder.Default
    private MasteryState masteryState = MasteryState.IN_PROGRESS;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "email"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"instructor"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Course course;

    @Column(length = 5000)
    @Builder.Default
    private String completedModuleIds = "";

    @Builder.Default
    private Integer score = 0;
}
