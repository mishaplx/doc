import { DataSource } from "typeorm";

import { ActionsProject } from "../../../../BACK_SYNC_FRONT/actions/actions.project";
import { customError } from "../../../../common/type/errorHelper.type";
import { ProjectEntity } from "../../../../entity/#organization/project/project.entity";
import { getAccessEnablingProject } from "../../accessEnabling/accessEnabling.project";
import { ACCESS_MSG } from "../../const/access.const";
import { toEntityProject } from "../../utils/utils.project";

export interface IAccessProjectValid {
  emp_id: number;
  actions: string[];
  args_parsed?: {
    project: ProjectEntity[] | number[];
    [key: string]: any;
  };
  args_origin?: any;
}

/**
 * ПРОВЕРКА ДОПУСТИМОСТИ ОПЕРАЦИИ
 * ПРИ НЕДОПУСТИМОЙ ОПЕРАЦИИ ВЫЗЫВАЕТСЯ ИСКЛЮЧЕНИЕ С ТЕКСТОМ ОШИБКИ
 * inject не используется из-за циклических ссылок
 */
export class AccessProject {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * ПРОВЕРИТЬ ДОСТУПНОСТЬ ОПЕРАЦИИ
   * @desc !!! не забывать: await !!!
   * @param project - project_id или projectEntity
   */
  public readonly valid = async (args: IAccessProjectValid): Promise<void> => {
    const { emp_id, actions, args_parsed } = args;
    const { project } = args_parsed;
    if (!project) return;

    // *** цикл по проектам ***
    for (const project_item of project) {
      const projectEntity = await toEntityProject({
        dataSource: this.dataSource,
        val: project_item,
        need_exist: true,
        need_actual: true,
      });

      // *** цикл по операциям ***
      for (const action of actions) {
        // валидность названия операции
        if (!(Object.values(ActionsProject) as string[]).includes(action))
          customError(ACCESS_MSG.OPERATION_UNKNOWN);

        // список допустимых операций
        const actionList = await getAccessEnablingProject({
          emp_id: emp_id,
          manager: this.dataSource.manager,
          projectEntity: projectEntity,
        });

        //   // если операции нет в списке допустимых
        //   if (!actionList.includes(action)) {
        //     customError(ACCESS_MSG.OPERATION_DISABLED);
        //   }

        //   // ******************************************
        //   // ИНЫЕ УСЛОВИЯ БЛОКИРОВКИ ОПЕРАЦИИ
        //   // С ПОЯСНЕНИЯМИ БЛОКИРОВКИ
        //   // ******************************************
      }
    }
  };
}
