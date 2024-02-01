BEGIN;

  -----------------------------------------
  -- POLICY: УДАЛИТЬ СТАРУЮ
  -----------------------------------------
  DROP POLICY IF EXISTS emp_isolation_job ON sad.jobs;


  -----------------------------------------
  -- POLICY: СОЗДАТЬ
  -----------------------------------------
	CREATE POLICY emp_isolation_job
    ON sad.jobs
    FOR ALL
    TO back_role

    -- ДОСТУП: ЧТЕНИЕ
    USING (
      sad.rls_policy_job(
        arg_jobs_id => sad.jobs.id,
        arg_jobs_status_id => sad.jobs.status_id,
        arg_jobs_user_created_id => sad.jobs.user_created_id,
        arg_jobs_author_id => sad.jobs.author_id,
        arg_jobs_parent_id => sad.jobs.parent_job_id,
        arg_jobs_doc_id => sad.jobs.doc_id,
        arg_is_write => FALSE
      )
    )

    -- ДОСТУП: ЗАПИСЬ
    WITH CHECK (
      sad.rls_policy_job(
        arg_jobs_id => sad.jobs.id,
        arg_jobs_status_id => sad.jobs.status_id,
        arg_jobs_user_created_id => sad.jobs.user_created_id,
        arg_jobs_author_id => sad.jobs.author_id,
        arg_jobs_parent_id => sad.jobs.parent_job_id,
        arg_jobs_doc_id => sad.jobs.doc_id,
        arg_is_write => TRUE
      )
    );

	ALTER TABLE sad.jobs
    ENABLE ROW LEVEL SECURITY;

COMMIT;

