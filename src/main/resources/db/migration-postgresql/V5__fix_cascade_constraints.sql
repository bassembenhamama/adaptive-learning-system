-- V5: Replace ON DELETE CASCADE with ON DELETE SET NULL
-- With soft-delete, DB-level hard cascades are dangerous (they destroy data).
-- ON DELETE SET NULL is a safe fallback if a hard delete ever sneaks through.

-- Step 1: Drop and recreate modules FK (course_id -> courses.id)
DO $$
DECLARE fk_name TEXT;
BEGIN
    SELECT constraint_name INTO fk_name
    FROM information_schema.table_constraints
    WHERE table_name = 'modules'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name IN (
          SELECT constraint_name FROM information_schema.key_column_usage
          WHERE table_name = 'modules' AND column_name = 'course_id'
      )
    LIMIT 1;

    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE modules DROP CONSTRAINT ' || quote_ident(fk_name);
    END IF;
END $$;

ALTER TABLE modules ADD CONSTRAINT fk_modules_course
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Step 2: Drop and recreate enrollments FK on course_id
DO $$
DECLARE fk_name TEXT;
BEGIN
    SELECT constraint_name INTO fk_name
    FROM information_schema.table_constraints
    WHERE table_name = 'enrollments'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name IN (
          SELECT constraint_name FROM information_schema.key_column_usage
          WHERE table_name = 'enrollments' AND column_name = 'course_id'
      )
    LIMIT 1;

    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE enrollments DROP CONSTRAINT ' || quote_ident(fk_name);
    END IF;
END $$;

ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_course
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Step 3: Drop and recreate enrollments FK on user_id
DO $$
DECLARE fk_name TEXT;
BEGIN
    SELECT constraint_name INTO fk_name
    FROM information_schema.table_constraints
    WHERE table_name = 'enrollments'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name IN (
          SELECT constraint_name FROM information_schema.key_column_usage
          WHERE table_name = 'enrollments' AND column_name = 'user_id'
      )
    LIMIT 1;

    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE enrollments DROP CONSTRAINT ' || quote_ident(fk_name);
    END IF;
END $$;

ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
