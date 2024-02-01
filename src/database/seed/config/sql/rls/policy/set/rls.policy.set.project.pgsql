BEGIN;
  DROP POLICY IF EXISTS emp_isolation_project ON sad.projects;

	CREATE POLICY emp_isolation_project
    ON sad.projects
    FOR ALL
    TO back_role

    -- ДОСТУП: ЧТЕНИЕ
    USING (
      -- пользователь не указан - дать доступ (см. rls.md)
      ( current_setting('rls.emp_id', TRUE) IS NULL )
      OR

      -- создатель и исполнитель имеют полный доступ
      (
        (
          (sad.projects.user_created_id = current_setting('rls.emp_id', TRUE)::int)
          OR
          (sad.projects.executor_id = current_setting('rls.emp_id', TRUE)::int)
        )
      )
      OR

      -- доступ исполнителей
      EXISTS(
        SELECT 1
        FROM sad.exec_in_project_route as t
        WHERE (
          (t.executor_id = current_setting('rls.emp_id', TRUE)::int)
          AND
          (t.project_id = sad.projects.id)
          AND
          (t.del = false)
        )
      )
      OR

      -- доступ по конкретным emp_id
      EXISTS(
        SELECT 1
        FROM sad.rls_access_emp as t
        WHERE (
          (t.emp_id = current_setting('rls.emp_id', TRUE)::int)
          AND
          (t.project_id = sad.projects.id)
        )
      )

      -- доступ по группам emp_id
      OR
      EXISTS(
        SELECT t1.project_id
        FROM
          sad.rls_access_group as t1
          inner join sad.rls_group_emp as t2
          on t1.rls_group_id = t2.rls_group_id
        WHERE (
          (t2.emp_id = current_setting('rls.emp_id', TRUE)::int)
          AND
          (t1.project_id = sad.projects.id)
        )
      )
    )

    -- ДОСТУП: ЗАПИСЬ
    WITH CHECK (
      -- пользователь не указан - дать доступ (см. rls.md)
      ( current_setting('rls.emp_id', TRUE) IS NULL )
      OR

      -- создатель и исполнитель имеют полный доступ
      (
        (
          (sad.projects.user_created_id = current_setting('rls.emp_id', TRUE)::int)
          OR
          (sad.projects.executor_id = current_setting('rls.emp_id', TRUE)::int)
        )
      )
      OR

      -- доступ исполнителей
      EXISTS(
        SELECT 1
        FROM sad.exec_in_project_route as t
        WHERE (
          (t.executor_id = current_setting('rls.emp_id', TRUE)::int)
          AND
          (t.project_id = sad.projects.id)
          AND
          (t.del = false)
        )
      )
      OR

      -- доступ по конкретным emp_id
      EXISTS(
        SELECT 1
        FROM sad.rls_access_emp as t
        WHERE (
          (t.emp_id = current_setting('rls.emp_id', TRUE)::int)
          AND
          (t.project_id = sad.projects.id)
          AND
          (t.read_only = FALSE)
        )
      )

      -- доступ по группам emp_id
      OR
      EXISTS(
        SELECT t1.project_id
        FROM
          sad.rls_access_group as t1
          inner join sad.rls_group_emp as t2
          on t1.rls_group_id = t2.rls_group_id
        WHERE (
          (t2.emp_id = current_setting('rls.emp_id', TRUE)::int)
          AND
          (t1.project_id = sad.projects.id)
          AND
          (t1.read_only = FALSE)
        )
      )
    );

	ALTER TABLE sad.projects
    ENABLE ROW LEVEL SECURITY;

COMMIT;
