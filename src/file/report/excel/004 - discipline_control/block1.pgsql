----------------------------------------------
-- ОТЧЕТ 4: ИСПОЛНИТЕЛЬСКАЯ ДИСЦИПЛИНА (ПО КОНТРОЛЛЕРАМ)
-- ПЕРЕД ЗАПУСКОМ ЗАМЕНИТЬ:
-- <<period_start>> - на начало периода, например: '2023-04-03 10:23:54'
-- <<period_end>> - на конец периода, например: '2023-04-03 10:23:54'
-- <<units>> - на список кодов подразделений, например: '1,27,36,44'
--             '' - все подразделения
-- <<control_types>> на список типов контроля, например: '2,3'
--             '' - все типы контроля
----------------------------------------------

begin;

set session r.period_start = '<<period_start>>';   -- '2023-04-03 10:23:54';   '<<period_start>>';
set session r.period_end = '<<period_end>>';       -- '2023-06-03 10:23:54';   '<<period_end>>';
set session r.units = '<<units>>';                 -- '1,27,36,44';            '<<units>>';
set session r.control_types = '<<control_types>>'; -- '2,3';                   '<<control_types>>';


----------------------------------------------
-- ДЛЯ ОТЛАДКИ
----------------------------------------------
--  set session r.period_start = '2023-10-01 00:00:00'; -- '2023-04-03 10:23:54';   '<<period_start>>';
--  set session r.period_end = '2023-12-31 00:00:00';   -- '2023-06-03 10:23:54';   '<<period_end>>';
--  set session r.units = '1';                          -- '1,27,36,44';            '<<units>>';
--  set session r.control_types = '3';                  -- '2,3';                   '<<control_types>>';


----------------------------------------------
-- БАЗОВАЯ ТАБЛИЦА
----------------------------------------------
CREATE TEMPORARY TABLE t1
ON COMMIT drop
as
select
  ----------------------------------------------
  -- КОНТРОЛЕР
  ----------------------------------------------
  -- ФИО - должность
  concat(staff.ln, ' ', staff.nm, ' ', staff.mn, ' - ', post.nm) as controller,



  ----------------------------------------------
  -- ПОРУЧЕНИЕ
  ----------------------------------------------
  -- id
  jobs.id as job__id,

  -- дата утверждения
  jobs.execution_start as job_exec_start,

  -- дата фактического исполнения
  -- jobs.fact_date as job_exec_end, - лучше брать отсюда, но поле НЕ ЗАПОЛНЯЕТСЯ
  job_control.date_fact as job_exec_end,

  -- поручение контроль: исполнить до (считать со следующего дня)
  date_trunc('day', jobs.execution_date + interval '1 day') as job_control_plan,

  -- признак контролируемого поручения (заполнение потом)
  true as job_all,

  -- признак исполненного поручения (заполнение потом)
  true as job_exec,

  -- признак неисполненного / просроченного поручения (заполнение потом)
  true as job_over



from sad.jobs jobs
inner join sad.job_control as job_control on job_control.job_id = jobs.id
inner join sad.emp as emp on job_control.controller_id = emp.id
inner join sad.users as users on emp.user_id = users.id
inner join sad.staff as staff on users.user_id = staff.id
inner join sad.post as post on emp.post_id = post.id
inner join sad.emp as emp2 on emp2.id = job_control.controller_id



where
  -- только поручения верхнего уровня
  jobs.parent_job_id is null and

  -- только направленные на исполнение (перекрывается статусами, на всякий случай)
  jobs.execution_start is not null and

  -- только поручения со статусами:
  -- "на исполнении" - 6
  -- "на предконтроле" - 8
  -- "предконтроль завершен" - 9
  -- "возвращено на исполнение" - 10
  -- "закрыто" - 11
  jobs.status_id = any(ARRAY[6, 8, 9, 10, 11]) and

  -- только поручения, контролируемые контролерами из выбранных подразделений
  case
    when current_setting('r.units') != ''
    then emp2.unit_id = ANY(string_to_array(current_setting('r.units'), ',')::int[])
    else true -- пустышка, т.к. нужно что-то прописать
  end and


  -- КОНТРОЛЬ ИСПОЛНЕНИЯ ПОРУЧЕНИЯ
  -- для одного поручения только один контроль (последний)
  job_control.id = (
    select max(id)
    from sad.job_control as jc
    where jc.job_id = jobs.id
  ) and

  -- только поручения, исполнение которых не завершено к началу отчетного периода
  (
    job_control.date_fact is null or
    job_control.date_fact > current_setting('r.period_start')::timestamp
  )


group by
  controller,
  job__id,
  job_exec_start,
  job_control.date_fact;



----------------------------------------------
-- ПРИЗНАК: КОНТРОЛИРУЕМОЕ ПОРУЧЕНИЕ (СТОЛБЕЦ Б)
----------------------------------------------
update t1
set
  job_all = (
	-- дата начала исполнения находится в отчетном периоде
    t1.job_exec_start >= current_setting('r.period_start')::timestamp and
    t1.job_exec_start < date_trunc('day', current_setting('r.period_end')::timestamp + interval '1 day')
  );


----------------------------------------------
-- ПРИЗНАК: ИСПОЛНЕННОЕ ПОРУЧЕНИЕ (СТОЛБЕЦ В)
----------------------------------------------
update t1
set
  job_exec = (
    case
      when t1.job_exec_end is null
      then (
        -- не считать просрочкой: она будет в следующем периоде
        false
      )
      else (
        -- дата фактического исполнения <= плановой даты
        t1.job_exec_end <= t1.job_control_plan
      )
    end
  );


----------------------------------------------
-- ПРИЗНАК: НЕИСПОЛНЕННОЕ/ПРОСРОЧЕННОЕ ПОРУЧЕНИЕ (СТОЛБЕЦ Г)
----------------------------------------------
update t1
set
  job_over = (
    case
      when t1.job_exec_end is null
      then (
        -- не считать просрочкой: она будет в следующем периоде
        false
      )
      else (
        -- дата завершения исполнения находится в отчетном периоде
        t1.job_exec_end >= current_setting('r.period_start')::timestamp and
        t1.job_exec_end < date_trunc('day', current_setting('r.period_end')::timestamp + interval '1 day') and

        -- даты завершения больше плановой даты
        t1.job_exec_end > t1.job_control_plan and

        -- плановая дата <= текущая дата
        t1.job_control_plan <= now()
      )
    end
  );


----------------------------------------------
-- ДЛЯ ОТЛАДКИ
----------------------------------------------
-- select * from t1;


----------------------------------------------
-- СОЗДАТЬ СВОДНУЮ ВЫБОРКУ
----------------------------------------------
CREATE TEMPORARY TABLE t2
ON COMMIT drop
as
select
  --  t1.user__id as user_id,

  -- контролер: ФИО - должность
  t1.controller as controller,

  -- поручения: контролируемые
  count( * ) filter (where t1.job_all ) as job_all,

  -- поручения: исполненные
  count( * ) filter (where t1.job_exec ) as job_exec,

  -- поручения: неисполненные/просроченные
  count( * ) filter (where t1.job_over ) as job_over

from t1
where
  t1.job_all or
  t1.job_exec or
  t1.job_over
group by
  controller
order by
  controller ASC;



----------------------------------------------
-- ИТОГ
----------------------------------------------
select * from t2;

commit;
