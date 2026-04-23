-- V8: Question Bank Schema
CREATE TABLE questions (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36) NOT NULL,
    statement TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_answer INT NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL,
    category VARCHAR(255),
    times_answered INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    discrimination_index DOUBLE PRECISION DEFAULT 0.5,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_question_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Add legacy column to modules
ALTER TABLE modules ADD COLUMN questions_json_legacy TEXT;

-- Copy current JSON data to legacy column
UPDATE modules SET questions_json_legacy = questions_json;

-- Indexes for performance
CREATE INDEX idx_question_module_id ON questions(module_id);
CREATE INDEX idx_question_difficulty ON questions(difficulty_level);
CREATE INDEX idx_question_module_difficulty ON questions(module_id, difficulty_level);
