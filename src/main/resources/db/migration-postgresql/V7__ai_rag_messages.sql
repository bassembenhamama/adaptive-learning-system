-- V7__ai_rag_messages.sql
-- Creates the messages table for Phase 10 RAG Pipeline.

CREATE TABLE IF NOT EXISTS messages (
    id                      VARCHAR(36)     NOT NULL PRIMARY KEY,
    module_id               VARCHAR(36)     NOT NULL,
    enrollment_id           VARCHAR(36)     NOT NULL,
    user_query              TEXT            NOT NULL,
    ai_response             TEXT            NOT NULL,
    was_out_of_context      BOOLEAN         NOT NULL DEFAULT FALSE,
    retrieved_chunk_count   INT             NOT NULL DEFAULT 0,
    processing_time_ms      BIGINT          NOT NULL DEFAULT 0,

    -- Auditable fields
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NULL,
    created_by              VARCHAR(255)    NULL,
    updated_by              VARCHAR(255)    NULL,

    CONSTRAINT fk_msg_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id) ON DELETE CASCADE
);

CREATE INDEX idx_msg_module ON messages (module_id);
CREATE INDEX idx_msg_enrollment ON messages (enrollment_id);
