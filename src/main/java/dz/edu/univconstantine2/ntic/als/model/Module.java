package dz.edu.univconstantine2.ntic.als.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper=true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "modules")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE modules SET deleted = TRUE WHERE id = ?")
@org.hibernate.annotations.SQLRestriction("deleted = FALSE OR deleted IS NULL")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Module extends Auditable {

    @Column(name = "deleted")
    @Builder.Default
    private Boolean deleted = false;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;
    private String type;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(length = 10000)
    private String contentUrl;

    private Integer threshold;

    @Column(columnDefinition = "TEXT")
    private String questionsJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"modules", "instructor", "description", "gradient", "category"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Course course;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private java.util.List<Question> questions = new java.util.ArrayList<>();
}
