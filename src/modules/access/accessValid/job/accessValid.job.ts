import { DataSource } from "typeorm";

import { ActionsJob } from "../../../../BACK_SYNC_FRONT/actions/actions.job";
import { customError } from "../../../../common/type/errorHelper.type";
import { JobEntity } from "../../../../entity/#organization/job/job.entity";
import { ExecJobEntity } from "../../../../entity/#organization/job/jobExec.entity";
import { getAccessEnablingJob } from "../../accessEnabling/accessEnabling.job";
import { ACCESS_MSG } from "../../const/access.const";
import { toEntityJob } from "../../utils/utils.job";
import { accessValidJobBase } from "./accessValid.job.base";
import { accessValidJobControl } from "./accessValid.job.control";
import { accessValidJobExecutor } from "./accessValid.job.executor";

export interface IAccessJobValid {
  emp_id: number;
  actions: string[];
  args_parsed?: {
    job: JobEntity[] | number[];
    exec_job?: ExecJobEntity[] | number[];
    [key: string]: any;
  };
  args_origin?: any;
}

/**
 * ПРОВЕРКА ДОПУСТИМОСТИ ОПЕРАЦИИ
 * ПРИ НЕДОПУСТИМОЙ ОПЕРАЦИИ ВЫЗЫВАЕТСЯ ИСКЛЮЧЕНИЕ С ТЕКСТОМ ОШИБКИ
 * inject не используется из-за циклических ссылок
 */
export class AccessJob {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * ПРОВЕРИТЬ ДОСТУПНОСТЬ ОПЕРАЦИИ
   * @desc !!! не забывать: await !!!
   * @param job [JobEntity | number] - список job_id или jobEntity
   * @param exec_job {ExecJobEntity | number} - exec_job_id или execJobEntity
   * @param args_origin {any} - оригинальные параметры вызываемого метода
   */
  public readonly valid = async (args: IAccessJobValid): Promise<void> => {
    const { emp_id, actions, args_parsed, args_origin } = args;
    const { job } = args_parsed;
    if (!job) return;

    // *** цикл по поручениям ***
    for (const job_item of job) {
      const jobEntity = await toEntityJob({
        dataSource: this.dataSource,
        val: job_item,
        need_exist: true,
        need_actual: true,
      });

      // *** цикл по операциям ***
      for (const action of actions) {
        // валидность названия операции
        if (!(Object.values(ActionsJob) as string[]).includes(action))
          customError(ACCESS_MSG.OPERATION_UNKNOWN);

        // список допустимых операций
        const actionList = await getAccessEnablingJob({
          emp_id: emp_id,
          manager: this.dataSource.manager,
          jobEntity: jobEntity,
        });

        // если операции нет в списке допустимых
        if (!actionList.includes(action)) {
          customError(ACCESS_MSG.OPERATION_DISABLED);
        }

        // ******************************************
        // ИНЫЕ УСЛОВИЯ БЛОКИРОВКИ ОПЕРАЦИИ
        // С ПОЯСНЕНИЯМИ БЛОКИРОВКИ
        // ******************************************

        /** ПОРУЧЕНИЕ */
        await accessValidJobBase({
          args: args,
          dataSource: this.dataSource,
          jobEntity: jobEntity,
          action: action,
        });

        /** ИСПОЛНИТЕЛЬ */
        await accessValidJobExecutor({
          args: args,
          dataSource: this.dataSource,
          jobEntity: jobEntity,
          action: action,
        });

        /** КОНТРОЛЕР */
        await accessValidJobControl({
          args: args,
          dataSource: this.dataSource,
          jobEntity: jobEntity,
          action: action,
        });
      }
    }
  };
}
