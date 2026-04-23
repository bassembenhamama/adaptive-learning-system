-- V10__adaptive_sessions.sql
-- Creates the learner_sessions table for the Adaptive Engine (Phase 8)

CREATE TABLE IF NOT EXISTS learner_sessions (
    id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
    enrollment_id        VARCHAR(36)  NOT NULL,
    module_id            VARCHAR(36)  NOT NULL,
    current_difficulty   VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM',
    answered_question_ids TEXT,
    answer_results       TEXT,
    current_question_id  VARCHAR(36),
    status               VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS',
    final_score          INT,

    -- Auditable columns
    created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by           VARCHAR(255),
    updated_by           VARCHAR(255),

    CONSTRAINT fk_ls_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
        ON DELETE CASCADE
);

-- Speed up the most common query: find an IN_PROGRESS session for a given enrollment+module
CREATE INDEX IF NOT EXISTS idx_ls_enrollment_module_status
    ON learner_sessions (enrollment_id, module_id, status);

-- Speed up session look-up by ID (covered by PK, but explicit for clarity in query plans)
CREATE INDEX IF NOT EXISTS idx_ls_status
    ON learner_sessions (status);
