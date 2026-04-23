-- V4.1: Fix enrollment schema
-- Renames enrolled_at -> created_at to align with Auditable.java,
-- and adds an index on deleted.
-- At this point deleted/created_by/updated_by/updated_at were added by V2.1.

ALTER TABLE enrollments CHANGE enrolled_at created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_enrollments_deleted ON enrollments(deleted);
