BEGIN;

  -----------------------------------------
  -- FUNCTION: ПРОВЕРИТЬ ОДИН SESSION
  -----------------------------------------
  CREATE OR REPLACE FUNCTION sad.rls_policy_session_one(
    IN  arg_session_id INT,
    IN  arg_session_user_id INT,
    OUT ret BOOLEAN
  )
  LANGUAGE plpgsql AS $$
  DECLARE
    rls_emp_id INT;
  BEGIN
    rls_emp_id = current_setting('rls.emp_id', TRUE)::int;

    ret =
      -- админ имеет полный доступ
      EXISTS(
        SELECT 1
        FROM sad.emp as emp
        WHERE (
          (emp.id = rls_emp_id)
          AND
          (emp.del = FALSE)
          AND
          (emp.temp = FALSE)
          AND
          (emp.is_admin = TRUE)
        )
      )
      OR

      -- сессия принадлежит пользователю
      EXISTS(
        SELECT session.id
        FROM
          sad.users_session_rls_off as session
          inner join sad.emp as emp
          on session.user_id = emp.user_id
        WHERE (
          (emp.id = rls_emp_id)
          AND
          (emp.del = FALSE)
          AND
          (emp.temp = FALSE)
          AND
          (emp.user_id = arg_session_user_id)
        )
      );

  END;
  $$;

COMMIT;
