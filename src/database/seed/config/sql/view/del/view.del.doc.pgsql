BEGIN;

  DROP VIEW IF EXISTS sad.doc_rls_off;

  ALTER VIEW sad.doc_view SET (security_invoker = off);

COMMIT;

