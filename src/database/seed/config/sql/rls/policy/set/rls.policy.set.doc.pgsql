BEGIN;

  -----------------------------------------
  -- POLICY: УДАЛИТЬ СТАРУЮ
  -----------------------------------------
	DROP POLICY IF EXISTS emp_isolation_doc ON sad.doc;


  -----------------------------------------
  -- POLICY: СОЗДАТЬ
  -----------------------------------------
	CREATE POLICY emp_isolation_doc
    ON sad.doc
    FOR ALL
    TO back_role

    -- ДОСТУП: ЧТЕНИЕ
    USING (
      sad.rls_policy_doc_one(
        arg_doc_id => sad.doc.id,
        arg_doc_author_id => sad.doc.author,
        arg_doc_status_id => sad.doc.docstatus,
        arg_doc_project_id => sad.doc.project_id,
        arg_doc_unit_id => sad.doc.unit_id,
        arg_is_write => FALSE
      )
    )

    -- ДОСТУП: ЗАПИСЬ
    WITH CHECK (
      sad.rls_policy_doc_one(
        arg_doc_id => sad.doc.id,
        arg_doc_author_id => sad.doc.author,
        arg_doc_status_id => sad.doc.docstatus,
        arg_doc_project_id => sad.doc.project_id,
        arg_doc_unit_id => sad.doc.unit_id,
        arg_is_write => TRUE
      )
    );

  ALTER TABLE sad.doc
    ENABLE ROW LEVEL SECURITY;

COMMIT;

