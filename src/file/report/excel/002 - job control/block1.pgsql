----------------------------------------------
-- ОТЧЕТ 2: НЕИСПОЛНЕННЫЕ ПОРУЧЕНИЯ
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
  -- ОТВЕТСТВЕННЫЙ ИСПОЛНИТЕЛЬ
  ----------------------------------------------
  -- ФИО - должность
  concat(staff.ln, ' ', staff.nm, ' ', staff.mn, ' - ', post.nm) as executor,

  -- дата назначения
  -- history_responsible.date_start as responsible_start,

  -- дата завершения
  -- history_responsible.date_end as responsible_end,




  ----------------------------------------------
  -- ДОКУМЕНТ (ЕСЛИ ЕСТЬ)
  ----------------------------------------------
  -- id
  doc.id as doc__id,

  -- заголовок
  case
    when doc.dr is not null
    then
      concat(
        kdoc.nm,
        ', ',
        lower(tdoc.nm),
        ' от ',
        case
        when doc.dr is not null
          then to_char(doc.dr, 'dd.mm.yyyy')::varchar
          else '________'
        end,
        ' № ',
        case
        when doc.reg_num is not null
          then doc.reg_num
          else '________'
        end,
        case
          when doc.isorg = true and org.nm is not null
          then concat(', ', org.nm)
        end,
        case
          when doc.isorg = false and citizen.nm is not null
          then concat(', ', citizen.nm)
        end,
        case
          when doc.isorg = true and region_org.id is not null
          then concat(', ', region_org.nm)
        end,
        case
          when doc.isorg = false and region_citizen.id is not null
          then concat(', ', region_citizen.nm)
        end
      )
    else null
  end as doc_info_header,

  -- содержание
  doc.body as doc_info_body,


  ----------------------------------------------
  -- ПОРУЧЕНИЕ
  ----------------------------------------------
  -- id
  jobs.id as job__id,

  -- body
  jobs.body as job_info_body,

  -- дата создания
  jobs.dtc as job_create,

  -- дата утверждения
  jobs.execution_start as job_exec_start,

  -- дата фактического исполнения
  -- jobs.fact_date as job_exec_end, - лучше брать отсюда, но поле НЕ ЗАПОЛНЯЕТСЯ
  job_control.date_fact as job_exec_end,


  ----------------------------------------------
  -- КОНТРОЛЬ ПОРУЧЕНИЯ
  ----------------------------------------------
  -- поручение контроль: исполнить до (считать со следующего дня)
  date_trunc('day', jobs.execution_date + interval '1 day') as job_control_plan,

  -- содержание
  concat(
    'Тип - ',
    jobs_control_types.nm,
    ', Рук.контр. - ',
    initcap(staff_controller.ln),
    ' ',
    case
      when not (staff_controller.nm is null or staff_controller.nm = '')
      then concat(initcap(left(staff_controller.nm, 1)), '.')
    end,
    case
      when not (staff_controller.mn is null or staff_controller.mn = '')
      then concat(initcap(left(staff_controller.mn, 1)), '.')
    end,
    case
      when not (jobs.num is null or jobs.num = '')
      then concat(', РКК - №',jobs.num)
    end
  ) as job_info_control,

  -- количество оставшихся дней (заполнение потом)
  0 as left_day



from sad.jobs jobs
inner join sad.history_responsible as history_responsible on history_responsible.job_id = jobs.id
inner join sad.emp as emp on history_responsible.emp_id = emp.id
inner join sad.job_control as job_control on job_control.job_id = jobs.id
inner join sad.users as users on emp.user_id = users.id
inner join sad.staff as staff on users.user_id = staff.id
inner join sad.post as post on emp.post_id = post.id
inner join sad.emp as emp2 on emp2.id = job_control.controller_id
left join sad.doc as doc on doc.id = jobs.doc_id
left join sad.tdoc as tdoc on tdoc.id = doc.tdoc
left join sad.kdoc as kdoc on kdoc.id = doc.cls_id
left join sad.org as org on org.id = doc.org_id
left join sad.citizen as citizen on citizen.id = doc.citizen_id
left join sad.region as region_org on region_org.id = org.region
left join sad.region as region_citizen on region_citizen.id = citizen.region_id
left join sad.jobs_control_types as jobs_control_types on jobs_control_types.id = job_control.job_control_type_id
left join sad.emp as emp_controller on emp_controller.id = job_control.controller_id
left join sad.users as users_controller on users_controller.id = emp_controller.user_id
left join sad.staff as staff_controller on staff_controller.id = users_controller.user_id



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
  -- только последний контроль
  job_control.id = (
    select max(id)
    from sad.job_control as jc
    where jc.job_id = jobs.id
  ) and

  -- только заданный тип контроля
  case
    when current_setting('r.control_types') != ''
    then jobs_control_types.id = ANY(string_to_array(current_setting('r.control_types'), ',')::int[])
    else true -- пустышка, т.к. нужно что-то прописать
  end and

  -- только поручения, исполнение которых не завершено к началу отчетного периода
  -- (
  --   job_control.date_fact is null or
  --   job_control.date_fact > current_setting('r.period_start')::timestamp
  -- ) and
  job_control.date_fact is null and


  -- ОТВЕТСТВЕННЫЙ ИСПОЛНИТЕЛЬ ПОРУЧЕНИЯ
  -- только последний ответственный
  history_responsible.id = (
    select max(id)
    from sad.history_responsible as t
    where t.job_id = jobs.id
  ) and


  ----------------------------------------------
  -- НЕИСПОЛНЕННОЕ/ПРОСРОЧЕННОЕ ПОРУЧЕНИЕ (ИЗ ОТЧЕТ 1 СТОЛБЕЦ В)
  ----------------------------------------------
  -- дата завершения исполнения находится в отчетном периоде
  -- job_control.date_fact >= current_setting('r.period_start')::timestamp and
  -- job_control.date_fact < date_trunc('day', current_setting('r.period_end')::timestamp + interval '1 day') and

  -- плановая дата находится в отчетном периоде
  job_control.date_plan >= current_setting('r.period_start')::timestamp and
  job_control.date_plan < date_trunc('day', current_setting('r.period_end')::timestamp + interval '1 day') and


  -- даты завершения больше плановой даты
  -- job_control.date_fact > date_trunc('day', jobs.execution_date + interval '1 day') and

  -- плановая дата <= текущая дата
  date_trunc('day', jobs.execution_date + interval '1 day') <= now()



group by
  executor,
  doc__id,
  job__id,
  job_control.date_fact,

  tdoc.nm,
  kdoc.nm,
  org.nm,
  citizen.nm,
  region_org.id,
  region_citizen.id,
  jobs_control_types.nm,
  staff_controller.ln,
  staff_controller.nm,
  staff_controller.mn;



----------------------------------------------
-- ПРОСТАВИТЬ КОЛИЧЕСТВО ПРОСРОЧЕННЫХ ДНЕЙ
----------------------------------------------
update t1
set
  left_day = EXTRACT(DAY FROM date_trunc('day', Now() + interval '1 day') - t1.job_control_plan)
where true;


----------------------------------------------
-- ДЛЯ ОТЛАДКИ
----------------------------------------------
--  select * from t1;


----------------------------------------------
-- СОЗДАТЬ СВОДНУЮ ВЫБОРКУ
----------------------------------------------
CREATE TEMPORARY TABLE t2
ON COMMIT drop
as
select
  -- ответственный исполнитель: ФИО - должность
  t1.executor as executor,

  -- инфо
  concat(
    case
      when t1.doc__id is not null
      then concat(
        doc_info_header,
        chr(10),
        doc_info_body
      )
      else 'Документ: отсутствует'
    end,
    chr(10),
    job_info_body,
    chr(10),
    'Срок - ',
    to_char(job_control_plan, 'dd.mm.yyyy'),
    ' / ',
    -- считать со следующего дня
    to_char(date_trunc('day', job_create + interval '1 day'), 'dd.mm.yyyy'),
    chr(10),
    job_info_control
  ) as info,

  -- поручение контроль: исполнить до
  job_control_plan as job_control_plan,

  -- количество оставшихся дней
  left_day as left_day

from t1
order by
  executor asc;


----------------------------------------------
-- ИТОГ
----------------------------------------------
select * from t2;

commit;
