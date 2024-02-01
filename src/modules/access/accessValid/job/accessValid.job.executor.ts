import { DataSource, In } from "typeorm";
import { ActionsJob } from "../../../../BACK_SYNC_FRONT/actions/actions.job";
import { customError } from "../../../../common/type/errorHelper.type";
import { JobEntity } from "../../../../entity/#organization/job/job.entity";
import { ExecJobEntity } from "../../../../entity/#organization/job/jobExec.entity";
import { toEntityExecJob } from "../../utils/utils.job";
import { IAccessJobValid } from "./accessValid.job";

// ******************************************
// ИНЫЕ УСЛОВИЯ БЛОКИРОВКИ ОПЕРАЦИИ
// С ПОЯСНЕНИЯМИ БЛОКИРОВКИ
// ИСПОЛНИТЕЛЬ
// ******************************************
export const accessValidJobExecutor = async (args2: {
  args: IAccessJobValid;
  dataSource: DataSource;
  jobEntity: JobEntity;
  action: string;
}): Promise<void> => {
  const { args, dataSource, jobEntity, action } = args2;
  const { args_parsed, args_origin } = args;
  const { exec_job } = args_parsed;

  // *** ИСПОЛНИТЕЛЬ: ДОБАВИТЬ
  // args_origin: CreateExecDto[]
  if (action == ActionsJob.JOB_EXECUTOR_ADD) {
    // должен добавляться минимум один исполнитель
    if (args_origin.length == 0) customError("Должен добавляться минимум один исполнитель");

    // добавлять исполнителей можно только в одно поручение
    let job_id = 0;
    for (const execJob of args_origin) {
      if (job_id == 0) job_id = execJob.job_id;
      if (job_id != execJob.job_id) customError("Исполнители должны быть для одного поручения");
    }

    // нельзя повторно добавить актуального исполнителя
    const items = await dataSource.getRepository(ExecJobEntity).findBy({
      job_id: jobEntity.id,
      emp_id: In(args_origin.map((item) => item.emp_id)),
      del: false,
    });
    if (items?.length > 0) customError("Исполнитель добавлен ранее");
  }

  // ***  ИСПОЛНИТЕЛЬ: УДАЛИТЬ
  if (action == ActionsJob.JOB_EXECUTOR_DEL) {
    if (!exec_job || exec_job?.length == 0) customError("Не указан исполнитель");

    // ответственный исполнитель
    for (const exec_job_item of exec_job) {
      const execJobEntity = await toEntityExecJob({
        dataSource: dataSource,
        val: exec_job_item,
        need_exist: true,
        need_actual: true,
      });
      if (execJobEntity.is_responsible)
        customError(
          "Нельзя удалить ответственного исполнителя. Для его удаления необходимо выбрать другого ответственного исполнителя",
        );
    }

    // исполнитель
    const execJobActual = await jobEntity.ExecJobActual;
    if (execJobActual.length == 1)
      customError(
        "Нельзя удалить единственного исполнителя. Для его удаления необходимо добавить другого исполнителя",
      );
  }
};
