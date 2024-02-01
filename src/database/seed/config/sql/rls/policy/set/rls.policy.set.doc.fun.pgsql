BEGIN;

  -----------------------------------------
  -- FUNCTION: ПРОВЕРИТЬ ОДИН DOC
  -----------------------------------------
  CREATE OR REPLACE FUNCTION sad.rls_policy_doc_one(
    IN  arg_doc_id INT,
    IN  arg_doc_author_id INT,
    IN  arg_doc_status_id INT,
    IN  arg_doc_project_id INT,
    IN  arg_doc_unit_id INT,
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

      -- автор имеет полный доступ
      ( arg_doc_author_id = rls_emp_id )
      OR

      -- доступ исполнителей (пересылка)
      -- документ исполнителю не доступен пока не будет ему переслан
      EXISTS(
        SELECT 1
        FROM sad.forwarding as t
        WHERE (
          (t.emp_receiver = rls_emp_id)
          AND
          (t.id_doc = arg_doc_id)
          AND
          (t.del = false)
        )
      )
      OR

      -- регистратор имеет доступ к новым документам:
      -- (регистратор подразделения только в отношении документов своего подразделения)
      --   без автора
      --   созданым из проекта
      (
        EXISTS(
          SELECT 1
          FROM sad.emp as t
          WHERE (
            (t.id = rls_emp_id)
            AND
            (
              (t.is_register = TRUE)
              OR
              (
                (t.is_register_unit = TRUE)
                AND
                (t.unit_id = arg_doc_unit_id)
              )
            )
          )
        )
        AND
        -- (
        --   NOT arg_is_write
        --   OR (arg_doc_status_id IN (1,2,3,4))
        -- )
        -- AND
        (
          (
            (arg_doc_author_id IS NULL)
            OR
            (arg_doc_project_id IS NULL)
          ) OR
          (
            (arg_doc_author_id IS NOT NULL)
            AND
            (arg_doc_project_id IS NOT NULL)
          )
        )
      )
      OR

      -- ПРОЕКТ, ИЗ КОТОРОГО СОЗДАН ДОКУМЕНТ: создатель и исполнитель имеют полный доступ
      EXISTS(
        SELECT 1
        FROM sad.projects as t
        WHERE (
          (t.id = arg_doc_project_id)
          AND
          (
            (t.user_created_id = rls_emp_id)
            OR
            (t.executor_id = rls_emp_id)
          )
        )
      )
      OR

      -- ПРОЕКТ, ИЗ КОТОРОГО СОЗДАН ДОКУМЕНТ: доступ исполнителей
      EXISTS(
        SELECT 1
        FROM sad.exec_in_project_route as t
        WHERE (
          (t.project_id = arg_doc_project_id)
          AND
          (t.executor_id = rls_emp_id)
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
          (t.doc_id = arg_doc_id)
          AND
          (arg_is_write OR (t.read_only = FALSE))
        )
      )
      OR

      -- доступ по группам emp_id
      EXISTS(
        SELECT t1.doc_id
        FROM
          sad.rls_access_group as t1
          inner join sad.rls_group_emp as t2
          on t1.rls_group_id = t2.rls_group_id
        WHERE (
          (t2.emp_id = rls_emp_id)
          AND
          (t1.doc_id = arg_doc_id)
          AND
          (arg_is_write OR (t1.read_only = FALSE))
        )
      );

  END;
  $$;

COMMIT;

