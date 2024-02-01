BEGIN;
  ALTER TABLE sad.users_session
    DISABLE ROW LEVEL SECURITY;

  DROP POLICY
    IF EXISTS emp_isolation_session
    ON sad.users_session;

COMMIT;