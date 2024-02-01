BEGIN;

  -- для доступа к данным без RLS-политики
  CREATE OR REPLACE VIEW sad.jobs_rls_off AS
    SELECT *
    FROM sad.jobs
    WHERE del=false;
  ALTER VIEW sad.jobs_rls_off SET (security_invoker = off);

COMMIT;
