import { DataSource } from "typeorm";
import { ActionsJob } from "../../../../BACK_SYNC_FRONT/actions/actions.job";
import { customError } from "../../../../common/type/errorHelper.type";
import { EmpEntity } from "../../../../entity/#organization/emp/emp.entity";
import { JobEntity } from "../../../../entity/#organization/job/job.entity";
import { IAccessJobValid } from "./accessValid.job";

// ******************************************
// ИНЫЕ УСЛОВИЯ БЛОКИРОВКИ ОПЕРАЦИИ
// С ПОЯСНЕНИЯМИ БЛОКИРОВКИ
// КОНТРОЛЕР
// ******************************************
export const accessValidJobControl = async (args2: {
  args: IAccessJobValid;
  dataSource: DataSource;
  jobEntity: JobEntity;
  action: string;
}): Promise<void> => {
  const { args, dataSource, jobEntity, action } = args2;

  // ***  СНЯТЬ С КОНТРОЛЯ
  if (action == ActionsJob.JOB_CONTROL_CANCEL) {
    const jobControlEntity = await jobEntity.JobControlLast;
    if (!jobControlEntity) customError("Нет контролера");
    const empEntity = await dataSource.manager.findOneByOrFail(EmpEntity, { id: args.emp_id });
    if (args.emp_id != jobControlEntity.controller_id && empEntity.is_admin == false)
      customError("Снять поручение с контроля может только контролер или админ");
  }
};
