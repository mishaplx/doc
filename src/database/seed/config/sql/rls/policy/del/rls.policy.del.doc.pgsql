BEGIN;
  ALTER TABLE sad.doc
    DISABLE ROW LEVEL SECURITY;

  DROP POLICY
    IF EXISTS emp_isolation_doc
    ON sad.doc;

COMMIT;
