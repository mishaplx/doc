BEGIN;

  ALTER TABLE sad.jobs
    DISABLE ROW LEVEL SECURITY;

  DROP POLICY
    IF EXISTS emp_isolation_job
    ON sad.jobs;

COMMIT;
