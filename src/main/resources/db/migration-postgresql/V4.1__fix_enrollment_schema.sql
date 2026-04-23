-- V4.1: Fix enrollment schema
-- Renames enrolled_at -> created_at to align with Auditable.java,
-- and adds an index on deleted.

ALTER TABLE enrollments RENAME COLUMN enrolled_at TO created_at;

CREATE INDEX idx_enrollments_deleted ON enrollments(deleted);
