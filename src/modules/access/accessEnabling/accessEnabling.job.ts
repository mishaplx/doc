import { EntityManager } from "typeorm";

import { ActionsJob } from "../../../BACK_SYNC_FRONT/actions/actions.job";
import { EmpEntity } from "../../../entity/#organization/emp/emp.entity";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { ACCESS_STATUS_JOB } from "../const/status/status.job";
import { delActions } from "../utils/utils";

/**
 * ПОРУЧЕНИЯ: ДОПУСТИМЫЕ ОПЕРАЦИИ
 */
export const getAccessEnablingJob = async (args: {
  emp_id: number;
  manager: EntityManager;
  jobEntity: JobEntity;
}): Promise<string[]> => {
  const { emp_id, manager, jobEntity } = args;
  const empEntity = await manager.findOneBy(EmpEntity, { id: emp_id, del: false });
  const jobControlEntity = await jobEntity.JobControlLast;

  // при отсутствии назначения все запрещено
  if (!empEntity) return [];

  // является ли emp админом, контролером, предконтролером
  const status = {
    admin: empEntity.is_admin,
    control: jobControlEntity?.controller_id == emp_id,
    precontrol: jobControlEntity?.prev_controller_id == emp_id,
  };

  // разрешенные операции для статуса
  let ret = Object.keys(ACCESS_STATUS_JOB).filter((item) =>
    ACCESS_STATUS_JOB[item].includes(jobEntity.status_id),
  );

  // ===============================
  // ИСПОЛНЕНИЕ
  // ===============================
  // запретить запрос на продление срока:
  // - исполнитель не ответственный
  // - отсутствует актуальный контролер
  if (
    emp_id != (await jobEntity.HistoryResponsibleActual)?.emp_id ||
    !(await jobEntity.JobControlLast)
  )
    ret = delActions(ret, [ActionsJob.JOB_ASK_PROLONG]);

  // ===============================
  // КОНТРОЛЬ
  // ===============================
  if (!status.admin && !status.control && !status.precontrol) {
    // запретить возврат на исполнение, продление срока, отказ в продлении срока:
    // - не админ, не контролер, не предконтроллер
    ret = delActions(ret, [
      ActionsJob.JOB_CONTROL_REWORK,
      ActionsJob.JOB_CONTROL_TERM_APPROV,
      ActionsJob.JOB_CONTROL_TERM_REFUSE,
    ]);
  }

  // запретить отказ в продлении срока: не запрошено продление срока
  if (!(await jobEntity.JobProlongRequestActual))
    ret = delActions(ret, [ActionsJob.JOB_CONTROL_TERM_REFUSE]);

  // ===============================
  // ПЕРИОДИЧНОСТЬ
  // ===============================
  // периодичность поручений: нет параметров или уже установлена - запретить установку периодичности
  const jobLoopEntity = await jobEntity.JobLoop;
  if (!jobLoopEntity || jobLoopEntity?.done) ret = delActions(ret, [ActionsJob.JOB_SET_LOOP]);

  // параметры периодичности поручений: уже установлена - запретить установку параметров периодичности
  if (jobLoopEntity?.done) ret = delActions(ret, [ActionsJob.JOB_SET_LOOP_PARAM]);

  // задача: действие доступно, выдавать сообщение
  // // не контролер: запретить снятие с контроля
  // if (emp_id != (await jobEntity.JobControlLast)?.controller_id)
  //   ret = delActions(ret, [ActionsJob.JOB_CONTROL_CANCEL]);

  // {
  //   ret = ret.filter((item) => ![
  //     String(ActionsJob.JOB_CONTROL_TERM_REFUSE),
  //   ].includes(item) );
  // }

  // // если не автор поручения: запретить утверждать или отправлять на доработку
  // if (emp_id != jobEntity.author_id) {
  //   ret = ret.filter((item) => ![
  //     String(ActionsJob.JOB_SET_APPROV),
  //     String(ActionsJob.JOB_SET_APPROV_SIGN),
  //     String(ActionsJob.JOB_SEND_REWORK),
  //   ].includes(item) );
  // }

  return ret;
};
