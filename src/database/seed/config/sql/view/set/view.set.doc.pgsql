BEGIN;

  -- для доступа к данным без RLS-политики
  CREATE OR REPLACE VIEW sad.doc_rls_off AS
    SELECT *
    FROM sad.doc
    WHERE del=false;
  ALTER VIEW sad.doc_rls_off SET (security_invoker = off);

  -- надо постгрес 15, иначе не работает
  ALTER VIEW IF EXISTS sad.doc_view SET (security_invoker = on);

COMMIT;
