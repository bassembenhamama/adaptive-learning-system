-- V6__chat_history.sql
-- Creates the chat_history table to persist AI Tutor Q&A exchanges.

CREATE TABLE IF NOT EXISTS chat_history (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    module_id       VARCHAR(36)     NOT NULL,
    enrollment_id   VARCHAR(36)     NOT NULL,
    user_message    VARCHAR(4000)   NOT NULL,
    ai_response     TEXT            NOT NULL,
    out_of_context  BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_module_enrollment ON chat_history (module_id, enrollment_id);
