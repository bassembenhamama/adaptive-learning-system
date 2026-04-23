package dz.edu.univconstantine2.ntic.als.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Stores a single Q&A exchange between a learner and the AI Tutor.
 * Scoped to a (moduleId, enrollmentId) pair so history is per-learner, per-module.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "chat_history",
        indexes = {
                @Index(name = "idx_chat_module_enrollment", columnList = "module_id, enrollment_id")
        })
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "module_id", nullable = false)
    private String moduleId;

    @Column(name = "enrollment_id", nullable = false)
    private String enrollmentId;

    @Column(length = 4000, nullable = false)
    private String userMessage;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String aiResponse;

    @Column(nullable = false)
    @Builder.Default
    private boolean outOfContext = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
