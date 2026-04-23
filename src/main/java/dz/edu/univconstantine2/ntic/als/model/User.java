package dz.edu.univconstantine2.ntic.als.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper=true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE users SET deleted = TRUE WHERE id = ?")
@org.hibernate.annotations.SQLRestriction("deleted = FALSE OR deleted IS NULL")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User extends Auditable {

    @Column(name = "deleted")
    @Builder.Default
    private Boolean deleted = false;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @JsonIgnore
    private String password;

    @Builder.Default
    private String role = "LEARNER";

    private String initials;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"user", "course"})
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Enrollment> enrollments;
}

