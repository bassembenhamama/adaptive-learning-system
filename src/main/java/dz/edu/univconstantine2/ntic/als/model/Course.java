package dz.edu.univconstantine2.ntic.als.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper=true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "courses")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE courses SET deleted = TRUE WHERE id = ?")
@org.hibernate.annotations.SQLRestriction("deleted = FALSE OR deleted IS NULL")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course extends Auditable {

    @Column(name = "deleted")
    @Builder.Default
    private Boolean deleted = false;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;
    private String category;

    @Column(length = 2000)
    private String description;

    private String gradient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    @JsonIgnoreProperties({"password", "email", "role", "initials"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"course"})
    @OrderBy("displayOrder ASC")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Module> modules;

    @OneToMany(mappedBy = "course")
    @JsonIgnoreProperties({"course", "user"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Enrollment> enrollments;
}
