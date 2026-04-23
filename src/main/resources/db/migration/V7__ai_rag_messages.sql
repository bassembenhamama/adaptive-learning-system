-- V7__ai_rag_messages.sql
-- Creates the messages table for Phase 10 RAG Pipeline.

CREATE TABLE IF NOT EXISTS messages (
    id                      VARCHAR(36)     NOT NULL PRIMARY KEY,
    module_id               VARCHAR(36)     NOT NULL,
    enrollment_id           VARCHAR(36)     NOT NULL,
    user_query              TEXT            NOT NULL,
    ai_response             LONGTEXT        NOT NULL,
    was_out_of_context      TINYINT(1)      NOT NULL DEFAULT 0,
    retrieved_chunk_count   INT             NOT NULL DEFAULT 0,
    processing_time_ms      BIGINT          NOT NULL DEFAULT 0,
    
    -- Auditable fields
    created_at              DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6)     NULL,
    created_by              VARCHAR(255)    NULL,
    updated_by              VARCHAR(255)    NULL,

    INDEX idx_msg_module (module_id),
    INDEX idx_msg_enrollment (enrollment_id),
    CONSTRAINT fk_msg_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
