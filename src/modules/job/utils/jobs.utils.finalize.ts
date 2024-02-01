import { EntityManager, In, IsNull, Not } from "typeorm";

import { JobStatus } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { DocStatus } from "../../doc/doc.const";
import { jobControl } from "../jobControl/jobControl.const";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { JobControlEntity } from "../../../entity/#organization/job/jobControl.entity";
import { ExecJobEntity } from "../../../entity/#organization/job/jobExec.entity";
import { IJobRel, getJobRelList } from "./jobs.utils.rel";

/**
 * ПОРУЧЕНИЕ: ЗАВЕРШИТЬ
 * ПЕРЕДАВАТЬ MANAGER С АДМИН-ПРАВАМИ ИЗ-ЗА RLS-ПОЛИТИКИ
 */
export const jobFinalize = async (args: {
  manager: EntityManager;
  job_id: number;
}): Promise<void> => {
  const { manager, job_id } = args;
  const jobEntity = await manager.findOneBy(JobEntity, {
    id: job_id,
    del: false,
  });
  const now = new Date();

  // список связанных поручений + основное поручение и их контроль
  const jobRelList: IJobRel[] = await getJobRelList({
    manager: manager,
    job_id: jobEntity.id,
  });
  const job_ids = jobRelList.map((item) => item.job_id);
  const job_control_ids = jobRelList.map((item) => item.job_control_id).filter((item) => item);

  // наличие смежных (незакрытых, неисполненных) основных поручений
  const jobs_near = jobEntity.doc_id
    ? (
        await manager.findBy(JobEntity, {
          doc_id: jobEntity.doc_id,
          parent_job_id: IsNull(),
          status_id: Not(In([JobStatus.FULFILLED, JobStatus.CLOSED])),
          del: false,
          temp: false,
        })
      ).length > 1
    : false;

  // КОНТРОЛЬ: ЕСТЬ
  const jobControlEntity = await jobEntity.JobControlLast;
  if (jobControlEntity) {
    // установить статус для всех поручений - закрыто + дата завершения
    await manager.update(
      JobEntity,
      {
        id: In(job_ids),
      },
      {
        status_id: JobStatus.CLOSED,
        fact_date: now,
      },
    );

    // завершить контроль
    await manager.update(
      JobControlEntity,
      {
        id: In(job_control_ids),
      },
      {
        controller_result: String(jobControl.CONTROLLER_RES_GETOUTOFCONTROL),
        date_fact: now,
      },
    );

    // КОНТРОЛЬ: НЕТ
  } else {
    // установить статус для всех поручений - исполнено + дата завершения
    await manager.update(
      JobEntity,
      { id: In(job_ids) },
      {
        status_id: JobStatus.FULFILLED,
        fact_date: now,
      },
    );
  }

  // Есть связанный документ и поручение верхнего уровня и нет смежных поручений:
  // - если нет смежных поручений - изменить статус документа
  // - добавить в документ сведения об исполнении (резолюция ответственного исполнителя)
  if (jobEntity.doc_id && jobEntity.parent_job_id == null) {
    // связанный документ
    const docEntity = await jobEntity.Doc;

    // новые параметры документа
    const doc_update_val = jobs_near ? {} : { docstatus: DocStatus.DONE.id };

    // актуальный ответственный исполнитель
    const responsibeEntity = await jobEntity.HistoryResponsibleActual;

    // ответственный исполнитель в таблице исполнителей (exec_job)
    const execJobEntity = await manager.findOne(ExecJobEntity, {
      where: {
        job_id: job_id,
        emp_id: responsibeEntity.emp_id,
        del: false,
      },
      order: {
        id: "DESC",
      },
    });

    // итоговая резолюция ответственного исполнителя
    if (execJobEntity) {
      const reportExecutorEntity = await execJobEntity.ReportLast;
      const note = reportExecutorEntity?.note;
      if (note) {
        const note_before = docEntity.short_note ? docEntity.short_note + "\n\n" : "";
        doc_update_val["short_note"] = note_before + "Поручение № " + jobEntity.num + ":\n" + note;
      }
    }

    if (Object.keys(doc_update_val).length > 0) {
      await manager.update(DocEntity, { id: docEntity.id }, doc_update_val);
    }
  }
};
