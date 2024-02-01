import { DataSource } from "typeorm";
import { ActionsJob } from "../../../../BACK_SYNC_FRONT/actions/actions.job";
import { customError } from "../../../../common/type/errorHelper.type";
import { JobEntity } from "../../../../entity/#organization/job/job.entity";
import { IAccessJobValid } from "./accessValid.job";

// ******************************************
// ИНЫЕ УСЛОВИЯ БЛОКИРОВКИ ОПЕРАЦИИ
// С ПОЯСНЕНИЯМИ БЛОКИРОВКИ
// ПОРУЧЕНИЕ
// ******************************************
export const accessValidJobBase = async (args2: {
  args: IAccessJobValid;
  dataSource: DataSource;
  jobEntity: JobEntity;
  action: string;
}): Promise<void> => {
  const { args, jobEntity, action } = args2;
  const { emp_id } = args;

  // *** ПОРУЧЕНИЕ: ОТПРАВИТЬ НА ИСПОЛНЕНИЕ
  if (action == ActionsJob.JOB_SEND_EXEC) {
    // нет ответственного исполнителя
    const hr = await jobEntity.HistoryResponsibleActual;
    if (!hr) customError("Нет ответственного исполнителя");
  }

  // *** ПОРУЧЕНИЕ: УТВЕРДИТЬ или ОТПРАВИТЬ НА ДОРАБОТКУ
  if (
    [
      ActionsJob.JOB_SET_APPROV,
      ActionsJob.JOB_SET_APPROV_SIGN,
      ActionsJob.JOB_SEND_REWORK,
    ].includes(action)
  ) {
    // не автор поручения
    if (emp_id != jobEntity.author_id) customError("Операция доступна только автору поручения");
  }
};
