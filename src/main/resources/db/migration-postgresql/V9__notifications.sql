-- V9: Notification table for FR-V06 (proactive remediation) and FR-V07 (recommendations)
CREATE TABLE notifications (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    enrollment_id   VARCHAR(36),
    module_id       VARCHAR(36),
    module_title    VARCHAR(500),
    content         TEXT            NOT NULL,
    type            VARCHAR(20)     NOT NULL,
    read_status     BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Auditable columns
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT chk_notification_type
        CHECK (type IN ('REMEDIATION', 'RECOMMENDATION'))
);

CREATE INDEX idx_notifications_user_id   ON notifications (user_id);
CREATE INDEX idx_notifications_read_status ON notifications (read_status);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, read_status);
