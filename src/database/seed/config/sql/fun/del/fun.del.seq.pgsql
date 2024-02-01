BEGIN;

  DROP FUNCTION IF EXISTS sad.sequences_update;

  -- TODO: выполнить один раз, потом удалить
  -- DROP FUNCTION IF EXISTS public.reset_sequences;

COMMIT;
