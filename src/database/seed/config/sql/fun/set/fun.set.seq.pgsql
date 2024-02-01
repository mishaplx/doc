BEGIN;


  -----------------------------------------
  -- FUNCTION: ОБНОВИТЬ SEQUENCES
  -----------------------------------------
  CREATE OR REPLACE FUNCTION sad.sequences_update()
  RETURNS void
  LANGUAGE plpgsql AS $$
  DECLARE
    schema_name text;
    table_name_text text;
    primary_key_column text;
    max_id bigint;
    seq_val bigint;
  BEGIN
    schema_name = CURRENT_SCHEMA();

    -- Цикл по таблицам
    FOR table_name_text IN
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = schema_name
      AND table_type = 'BASE TABLE'

    LOOP
      -- Найти столбец primary key
      SELECT column_name
      INTO primary_key_column
      FROM information_schema.columns
      WHERE
        table_schema = schema_name AND
        table_name = table_name_text AND
        column_default LIKE 'nextval%%';
      RAISE INFO '- %.%.%', schema_name, table_name_text, primary_key_column;

      -- Check if primary key column exists
      IF primary_key_column IS NOT NULL THEN
        -- Получить максимальное значение столбца primary key
        EXECUTE format(
          'SELECT COALESCE(MAX(%I), 0) FROM %I.%I',
          primary_key_column,
          schema_name,
          table_name_text
        )
        INTO max_id;
        RAISE INFO '  max_id = %', max_id;

        -- Новое значение sequence
        IF max_id + 1 < 10000 THEN
          seq_val := 10000;
        ELSE
          seq_val := max_id + 1;
        END IF;
        RAISE INFO '  seq_val = % %', seq_val, chr(10);

        -- Изменить sequence
        EXECUTE format('SELECT setval(pg_get_serial_sequence(''%I.%I'', %L), %s)', schema_name, table_name_text, primary_key_column, seq_val);
      END IF;
    END LOOP;
  END;
  $$;

COMMIT;
