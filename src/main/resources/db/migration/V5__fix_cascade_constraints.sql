-- V5: Replace ON DELETE CASCADE with ON DELETE SET NULL
-- With soft-delete, DB-level hard cascades are dangerous (they destroy data).
-- ON DELETE SET NULL is a safe fallback if a hard delete ever sneaks through.

-- Step 1: Drop and recreate modules FK (course_id -> courses.id)
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'modules'
    AND COLUMN_NAME = 'course_id' AND REFERENCED_TABLE_NAME = 'courses' LIMIT 1);
SET @sql = CONCAT('ALTER TABLE modules DROP FOREIGN KEY `', @fk_name, '`');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE modules ADD CONSTRAINT fk_modules_course
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Step 2: Drop and recreate enrollments FK on course_id
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enrollments'
    AND COLUMN_NAME = 'course_id' AND REFERENCED_TABLE_NAME = 'courses' LIMIT 1);
SET @sql = CONCAT('ALTER TABLE enrollments DROP FOREIGN KEY `', @fk_name, '`');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_course
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Step 3: Drop and recreate enrollments FK on user_id
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enrollments'
    AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users' LIMIT 1);
SET @sql = CONCAT('ALTER TABLE enrollments DROP FOREIGN KEY `', @fk_name, '`');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
