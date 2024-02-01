BEGIN;

  -- для доступа к данным без RLS-политики
  CREATE OR REPLACE VIEW sad.users_session_rls_off AS
    SELECT *
    FROM sad.users_session
    WHERE date_expiration >= Now();
  ALTER VIEW sad.users_session_rls_off SET (security_invoker = off);

COMMIT;
