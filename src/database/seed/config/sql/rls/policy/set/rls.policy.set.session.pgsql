BEGIN;

  -----------------------------------------
  -- POLICY: УДАЛИТЬ СТАРУЮ
  -----------------------------------------
	DROP POLICY IF EXISTS emp_isolation_session ON sad.users_session;


  -----------------------------------------
  -- POLICY: СОЗДАТЬ
  -----------------------------------------
	CREATE POLICY emp_isolation_session
    ON sad.users_session
    FOR ALL
    TO back_role

    -- ДОСТУП: ЧТЕНИЕ
    USING (
      sad.rls_policy_session_one(
        arg_session_id => sad.users_session.id,
        arg_session_user_id => sad.users_session.user_id
      )
    )

    -- ДОСТУП: ЗАПИСЬ
    WITH CHECK (
      sad.rls_policy_session_one(
        arg_session_id => sad.users_session.id,
        arg_session_user_id => sad.users_session.user_id
      )
    );

  ALTER TABLE sad.users_session
    ENABLE ROW LEVEL SECURITY;

COMMIT;

