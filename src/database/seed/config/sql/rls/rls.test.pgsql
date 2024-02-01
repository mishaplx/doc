-- BEGIN;
-- 	set rls.emp_id = 5114;
-- 	select * from sad.doc;
-- COMMIT;

-- BEGIN;
-- 	set rls.emp_id = 5115;
-- 	select * from sad.jobs;
-- COMMIT;

BEGIN;
	set rls.emp_id = 6;
	select * from sad.doc;
COMMIT;
