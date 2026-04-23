package dz.edu.univconstantine2.ntic.als.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_user_id", columnList = "user_id"),
        @Index(name = "idx_notifications_read_status", columnList = "read_status")
    })
public class Notification extends Auditable {

    @Id
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    /** The user who should receive this notification */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "enrollment_id")
    private String enrollmentId;

    @Column(name = "module_id")
    private String moduleId;

    @Column(name = "module_title")
    private String moduleTitle;

    /** Main notification body — AI-generated or static */
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "read_status", nullable = false)
    @Builder.Default
    private boolean readStatus = false;

    /** Convenience factory — generates a UUID for the id field */
    public static Notification create(Long userId, String enrollmentId, String moduleId,
                                      String moduleTitle, String content, NotificationType type) {
        return Notification.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .enrollmentId(enrollmentId)
                .moduleId(moduleId)
                .moduleTitle(moduleTitle)
                .content(content)
                .type(type)
                .readStatus(false)
                .build();
    }
}
