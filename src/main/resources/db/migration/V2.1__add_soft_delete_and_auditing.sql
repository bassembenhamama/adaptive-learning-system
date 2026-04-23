-- V2.1: Soft Deletes and Auditing
-- Adds only the columns that V1 did NOT already create.
-- V1 created: courses.deleted, courses/modules/users created_at/updated_at
-- This migration adds: deleted on modules/users/enrollments, and created_by/updated_by on all tables.

-- courses: deleted already exists, only add audit columns
ALTER TABLE courses  ADD COLUMN created_by  VARCHAR(255);
ALTER TABLE courses  ADD COLUMN updated_by  VARCHAR(255);

-- modules: no deleted column yet
ALTER TABLE modules  ADD COLUMN deleted     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE modules  ADD COLUMN created_by  VARCHAR(255);
ALTER TABLE modules  ADD COLUMN updated_by  VARCHAR(255);

-- users: no deleted column yet
ALTER TABLE users    ADD COLUMN deleted     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users    ADD COLUMN created_by  VARCHAR(255);
ALTER TABLE users    ADD COLUMN updated_by  VARCHAR(255);

-- enrollments: no deleted, no created_by, no updated_by, no updated_at yet
ALTER TABLE enrollments ADD COLUMN deleted      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE enrollments ADD COLUMN created_by   VARCHAR(255);
ALTER TABLE enrollments ADD COLUMN updated_by   VARCHAR(255);
ALTER TABLE enrollments ADD COLUMN updated_at   TIMESTAMP NULL;

-- Indexes
CREATE INDEX idx_courses_deleted    ON courses(deleted);
CREATE INDEX idx_modules_deleted    ON modules(deleted);
CREATE INDEX idx_users_deleted      ON users(deleted);
CREATE INDEX idx_enrollments_user   ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
