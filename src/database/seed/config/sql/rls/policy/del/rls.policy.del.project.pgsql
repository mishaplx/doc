BEGIN;

  ALTER TABLE sad.projects
    DISABLE ROW LEVEL SECURITY;

  DROP POLICY
    IF EXISTS emp_isolation_project
    ON sad.project;

COMMIT;