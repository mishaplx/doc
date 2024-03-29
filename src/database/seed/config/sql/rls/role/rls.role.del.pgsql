  -----------------------------------------
  -- FUNCTION TEMP: УДАЛЕНИЕ РОЛЕЙ
  -----------------------------------------
  CREATE OR REPLACE FUNCTION pg_temp.rls_role_del(
    OUT ret BOOLEAN
  )
  LANGUAGE plpgsql AS $$
  DECLARE
    info VARCHAR;
  begin
    RAISE NOTICE 'УДАЛЕНИЕ РОЛЕЙ: СТАРТ';

    DROP ROLE IF EXISTS back;

    REASSIGN OWNED BY back_role TO postgres;

    REVOKE ALL
      ON ALL TABLES
      IN schema sad
      FROM back_role;

    REVOKE USAGE
      ON SCHEMA sad
      FROM back_role;

    REVOKE ALL PRIVILEGES
      ON ALL TABLES
      IN SCHEMA sad
      FROM back_role;

    REVOKE ALL PRIVILEGES
      ON ALL SEQUENCES
      IN SCHEMA sad
      FROM back_role;

    REVOKE ALL PRIVILEGES
      ON ALL FUNCTIONS
      IN SCHEMA sad
      FROM back_role;

    DROP OWNED BY back_role;
    DROP ROLE IF EXISTS back_role;

    RAISE NOTICE 'УДАЛЕНИЕ РОЛЕЙ: ОК';
    ret = true;
  END;
  $$;

  SELECT * FROM pg_temp.rls_role_del();

-- SELECT grantee AS user, CONCAT(table_schema, '.', table_name) AS table
-- FROM information_schema.role_table_grants
-- WHERE grantee = 'back_role'
-- GROUP BY table_name, table_schema, grantee;

-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE GRANT OPTION FOR ALL PRIVILEGES ON TABLES FROM back_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE GRANT OPTION FOR ALL PRIVILEGES ON SEQUENCES FROM back_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE GRANT OPTION FOR ALL PRIVILEGES ON FUNCTIONS FROM back_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE GRANT OPTION FOR ALL PRIVILEGES ON ROUTINES FROM back_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE GRANT OPTION FOR ALL PRIVILEGES ON TYPES FROM back_role;

-- REVOKE GRANT OPTION FOR ALL PRIVILEGES ON SCHEMA sad FROM back_role;
-- REVOKE GRANT OPTION FOR ALL PRIVILEGES ON ALL TABLES IN SCHEMA sad FROM back_role;
-- REVOKE GRANT OPTION FOR ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA sad FROM back_role;
-- REVOKE GRANT OPTION FOR ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA sad FROM back_role;
-- REVOKE GRANT OPTION FOR ALL PRIVILEGES ON ALL PROCEDURES IN SCHEMA sad FROM back_role;
-- REVOKE GRANT OPTION FOR ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA sad FROM back_role;

-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE ALL PRIVILEGES ON TABLES FROM back_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE ALL PRIVILEGES ON SEQUENCES FROM back_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE ALL PRIVILEGES ON FUNCTIONS FROM back_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE ALL PRIVILEGES ON ROUTINES FROM back_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sad REVOKE ALL PRIVILEGES ON TYPES FROM back_role;

-- REVOKE ALL PRIVILEGES ON SCHEMA sad FROM back_role;
-- REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA sad FROM back_role;
-- REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA sad FROM back_role;
-- REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA sad FROM back_role;
-- REVOKE ALL PRIVILEGES ON ALL PROCEDURES IN SCHEMA sad FROM back_role;
-- REVOKE ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA sad FROM back_role;

