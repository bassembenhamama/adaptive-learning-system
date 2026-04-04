package dz.edu.univconstantine2.ntic.als.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "modules")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Module {

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
    private Course course;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getOrder() { return displayOrder; }
    public void setOrder(Integer order) { this.displayOrder = order; }

    public String getContentUrl() { return contentUrl; }
    public void setContentUrl(String contentUrl) { this.contentUrl = contentUrl; }

    public Integer getThreshold() { return threshold; }
    public void setThreshold(Integer threshold) { this.threshold = threshold; }

    public String getQuestionsJson() { return questionsJson; }
    public void setQuestionsJson(String questionsJson) { this.questionsJson = questionsJson; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
}
