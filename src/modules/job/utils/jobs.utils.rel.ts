import { EntityManager } from "typeorm";

export interface IJobRel {
  job_id: number;
  job_control_id: number;
}

/**
 * СПИСОК СВЯЗАННЫХ ПОРУЧЕНИЙ [[job_id, job_control_id],...]
 * основное + зависимые поручения
 * если контроля нет - job_control_id = null
 */
export async function getJobRelList(args: {
  manager: EntityManager;
  job_id: number;
}): Promise<IJobRel[]> {
  const { manager, job_id } = args;
  const jobRelList: IJobRel[] = await manager.query(
    `WITH RECURSIVE r AS (
        -- стартовая часть рекурсии
        SELECT
            a.id::int "job_id",
            -- max для получения актуальной записи
            (SELECT MAX(b.id)::int FROM sad.job_control b WHERE b.job_id = a.id) "job_control_id"
        FROM sad.jobs a
        WHERE a.id = $1

        UNION ALL

        -- рекурсивная часть
        SELECT
            a.id::int "job_id",
            -- max для получения актуальной записи
            (SELECT MAX(b.id)::int FROM sad.job_control b WHERE b.job_id = a.id) "job_control_id"
        FROM sad.jobs a
            JOIN r ON a.parent_job_id = r."job_id"
    )
    SELECT * FROM r;`,
    [job_id],
  );

  return jobRelList;
}
