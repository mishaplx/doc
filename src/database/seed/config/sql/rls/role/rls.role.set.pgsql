BEGIN;
  -----------------------------------------
  -- FUNCTION TEMP: НАСТРОЙКА РОЛЕЙ
  -----------------------------------------
  CREATE OR REPLACE FUNCTION pg_temp.rls_role_set(
    OUT ret BOOLEAN
  )
  LANGUAGE plpgsql AS $$
  DECLARE
    info VARCHAR;
  begin
    RAISE NOTICE 'НАСТРОЙКА РОЛЕЙ: СТАРТ';

    -- РОЛЬ back_role: СОЗДАТЬ
    IF NOT EXISTS(
      SELECT 1 from pg_roles where rolname='back_role'
    ) THEN
      CREATE ROLE back_role WITH
        NOSUPERUSER
        NOCREATEDB
        NOCREATEROLE
        INHERIT
        NOLOGIN
        NOREPLICATION
        NOBYPASSRLS
        CONNECTION LIMIT -1;
        info = 'ок';
    ELSE
      info = 'пропущено';
    END IF;
    RAISE NOTICE 'Создание пользователя back_role: %', info;

    GRANT USAGE
      ON SCHEMA sad
      TO back_role;

    -- для всех таблиц
    GRANT ALL PRIVILEGES
      ON ALL TABLES
      IN SCHEMA sad
      TO back_role;

    ALTER DEFAULT PRIVILEGES
      IN SCHEMA sad
      GRANT ALL PRIVILEGES
      ON TABLES
      TO back_role;

    GRANT ALL
      ON ALL SEQUENCES
      IN SCHEMA sad
      TO back_role;

    ALTER DEFAULT PRIVILEGES
      IN SCHEMA sad
      GRANT ALL
      ON SEQUENCES
      TO back_role;

    -- -- для RLS таблиц
    -- REVOKE DELETE, TRUNCATE, TRIGGER
    --   ON
    --     sad.projects,
    --     sad.doc,
    --     sad.jobs
    --   FROM back_role;

    -- ПОЛЬЗОВАТЕЛЬ back: СОЗДАТЬ
    IF NOT EXISTS(
      SELECT 1 from pg_roles where rolname='back'
    ) then
      CREATE ROLE back WITH
        PASSWORD 'back'
        NOSUPERUSER
        NOCREATEDB
        NOCREATEROLE
        INHERIT
        LOGIN
        NOREPLICATION
        NOBYPASSRLS
        CONNECTION LIMIT -1;
      info = 'ок';
    ELSE
      info = 'пропущено';
    END IF;
    RAISE NOTICE 'Создание пользователя back: %', info;

    GRANT back_role
      TO back;

    RAISE NOTICE 'НАСТРОЙКА РОЛЕЙ: ОК';
    ret = true;
  END;
  $$;

  SELECT * FROM pg_temp.rls_role_set();

COMMIT;
