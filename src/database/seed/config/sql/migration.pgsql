BEGIN;
  -- truncate sad.sys_migrations_typeorm;

  -- УДАЛИТЬ ВСЕ ССЫЛКИ НА МИГРАЦИИ, КРОМЕ МИГРАЦИЙ, ЗАПУСКАЕМЫХ ОДИН РАЗ
  -- delete from sad.sys_migrations_typeorm where name like 'Once%';
COMMIT;
