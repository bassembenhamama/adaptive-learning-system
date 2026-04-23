-- V6__chat_history.sql
-- Creates the chat_history table to persist AI Tutor Q&A exchanges.

CREATE TABLE IF NOT EXISTS chat_history (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    module_id       VARCHAR(36)     NOT NULL,
    enrollment_id   VARCHAR(36)     NOT NULL,
    user_message    VARCHAR(4000)   NOT NULL,
    ai_response     TEXT            NOT NULL,
    out_of_context  TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX idx_chat_module_enrollment (module_id, enrollment_id),
    CONSTRAINT fk_chat_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
