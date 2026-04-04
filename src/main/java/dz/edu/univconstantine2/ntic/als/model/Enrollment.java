package dz.edu.univconstantine2.ntic.als.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "enrollments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "email"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"instructor"})
    private Course course;

    @Column(length = 5000)
    private String completedModuleIds = "";

    private int score = 0;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getCompletedModuleIds() { return completedModuleIds; }
    public void setCompletedModuleIds(String completedModuleIds) { this.completedModuleIds = completedModuleIds; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}
