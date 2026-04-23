package dz.edu.univconstantine2.ntic.als.dto;

import dz.edu.univconstantine2.ntic.als.model.NotificationType;

import java.time.Instant;

/**
 * Projection returned by GET /api/notifications/my.
 * Omits userId (sensitive) and updatedAt (not needed by the frontend).
 */
public record NotificationDTO(
        String id,
        String enrollmentId,
        String moduleId,
        String moduleTitle,
        String content,
        NotificationType type,
        boolean readStatus,
        Instant createdAt
) {}
