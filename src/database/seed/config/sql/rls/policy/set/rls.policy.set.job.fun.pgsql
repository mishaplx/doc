BEGIN;

  -----------------------------------------
  -- FUNCTION: ПРОВЕРИТЬ ОДИН JOB
  -----------------------------------------
  CREATE OR REPLACE FUNCTION sad.rls_policy_job_one(
    IN  arg_jobs_id INT,
    IN  arg_jobs_status_id INT,
    IN  arg_jobs_user_created_id INT,
    IN  arg_jobs_author_id INT,
    IN  arg_is_write BOOLEAN DEFAULT FALSE,
    OUT ret BOOLEAN
  )
  LANGUAGE plpgsql AS $$
  DECLARE
    rls_emp_id INT;
  BEGIN
    rls_emp_id = current_setting('rls.emp_id', TRUE)::int;

    ret =
      -- пользователь не указан - дать доступ (см. rls.md)
      ( rls_emp_id IS NULL )
      OR

      -- создатель и автор имеют полный доступ
      (
        (
          (arg_jobs_user_created_id = rls_emp_id)
          OR
          (arg_jobs_author_id = rls_emp_id)
        )
      )
      OR

      -- доступ исполнителей
      EXISTS(
        SELECT 1
        FROM sad.exec_job as t
        WHERE (
          (t.emp_id = rls_emp_id)
          AND
          (t.job_id = arg_jobs_id)
          AND
          (arg_jobs_status_id IN (6,7,8,9,10,11))
          AND
          (t.del = false)
        )
      )
      OR

      -- доступ контролеров и предконтролеров
      EXISTS(
        SELECT 1
        FROM sad.job_control as t
        WHERE (
          (
            (t.controller_id = rls_emp_id)
            OR
            (t.prev_controller_id = rls_emp_id)
          )
          AND
          (t.job_id = arg_jobs_id)
        )
      )
      OR

      -- доступ по конкретным emp_id
      EXISTS(
        SELECT 1
        FROM sad.rls_access_emp as t
        WHERE (
          (t.emp_id = rls_emp_id)
          AND
          (t.job_id = arg_jobs_id)
          AND
          (arg_is_write OR (t.read_only = FALSE))
        )
      )
      OR

      -- доступ по конкретным emp_id
      EXISTS(
        SELECT t1.job_id
        FROM
          sad.rls_access_group as t1
          inner join sad.rls_group_emp as t2
          on t1.rls_group_id = t2.rls_group_id
        WHERE (
          (t2.emp_id = rls_emp_id)
          AND
          (t1.job_id = arg_jobs_id)
          AND
          (arg_is_write OR (t1.read_only = FALSE))
        )
      );

  END;
  $$;



  -----------------------------------------
  -- FUNCTION: ПРОВЕРИТЬ ЦЕПОЧКУ JOB
  -----------------------------------------
  CREATE OR REPLACE FUNCTION sad.rls_policy_job(
    IN  arg_jobs_id INT,
    IN  arg_jobs_status_id INT,
    IN  arg_jobs_user_created_id INT,
    IN  arg_jobs_author_id INT,
    IN  arg_jobs_parent_id INT,
    IN  arg_jobs_doc_id INT,
    IN  arg_is_write BOOLEAN DEFAULT FALSE,
    OUT ret BOOLEAN
  )
  LANGUAGE plpgsql AS $$
  DECLARE
    var_job RECORD;
    var_job_parent_id INT;
    var_doc RECORD;
    var_doc_id INT;
  BEGIN
    -- проверить предварительную доступность запрашиваемого поручения
    ret = sad.rls_policy_job_one(
      arg_jobs_id => arg_jobs_id,
      arg_jobs_status_id => arg_jobs_status_id,
      arg_jobs_user_created_id => arg_jobs_user_created_id,
      arg_jobs_author_id => arg_jobs_author_id,
      arg_is_write => arg_is_write
    );

    -- id документа, из которого создано поручение
    var_doc_id = arg_jobs_doc_id;

    -- проверить доступность родительских поручений
    IF NOT ret THEN
      var_job_parent_id = arg_jobs_parent_id;
      WHILE var_job_parent_id IS NOT NULL LOOP
        SELECT *
        INTO var_job
        FROM sad.jobs_rls_off
        WHERE id = var_job_parent_id
        LIMIT 1;

        var_doc_id = var_job.doc_id;

        IF (var_job IS NULL) THEN
          var_job_parent_id = NULL;
        ELSE
          ret = ret OR sad.rls_policy_job_one(
            arg_jobs_id => var_job.id,
            arg_jobs_status_id => var_job.status_id,
            arg_jobs_user_created_id => var_job.user_created_id,
            arg_jobs_author_id => var_job.author_id,
            arg_is_write => arg_is_write
          );
          IF ret THEN
            var_job_parent_id = NULL;
          ELSE
            var_job_parent_id = var_job.parent_job_id;
          END IF;
        END IF;
      END LOOP;
    END IF;

    -- проверить доступность документа, из которого создано root-поручение
    IF NOT ret AND (var_doc_id IS NOT NULL) THEN
      SELECT *
      INTO var_doc
      FROM sad.doc_rls_off
      WHERE id = var_doc_id
      LIMIT 1;

      ret = ret OR sad.rls_policy_doc_one(
        arg_doc_id => var_doc.id,
        arg_doc_author_id => var_doc.author,
        arg_doc_status_id => var_doc.docstatus,
        arg_doc_project_id => var_doc.project_id,
        arg_doc_unit_id => var_doc.unit_id,
        arg_is_write => arg_is_write
      );
    END IF;

  END;
  $$;

COMMIT;

