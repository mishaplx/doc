import { DataSource } from "typeorm";

import { ActionsDoc } from "../../../../BACK_SYNC_FRONT/actions/actions.doc";
import { customError } from "../../../../common/type/errorHelper.type";
import { DocEntity } from "../../../../entity/#organization/doc/doc.entity";
import { getAccessEnablingDoc } from "../../accessEnabling/accessEnabling.doc";
import { ACCESS_MSG } from "../../const/access.const";
import { toEntityDoc } from "../../utils/utils.doc";
import { accessValidDocCorr } from "./accessValid.doc.corr";

export interface IAccessDocValid {
  emp_id: number;
  actions: string[];
  args_parsed?: {
    doc: DocEntity[] | number[];
    [key: string]: any;
  };
  args_origin?: any;
}

/**
 * ПРОВЕРКА ДОПУСТИМОСТИ ОПЕРАЦИИ
 * ПРИ НЕДОПУСТИМОЙ ОПЕРАЦИИ ВЫЗЫВАЕТСЯ ИСКЛЮЧЕНИЕ С ТЕКСТОМ ОШИБКИ
 * inject не используется из-за циклических ссылок
 */
export class AccessDoc {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * ПРОВЕРИТЬ ДОСТУПНОСТЬ ОПЕРАЦИИ
   * @desc !!! не забывать: await !!!
   * @param doc - doc_id или docEntity
   */
  public readonly valid = async (args: IAccessDocValid): Promise<void> => {
    const { emp_id, actions, args_parsed } = args;
    const { doc } = args_parsed;
    if (!doc) return;

    // *** цикл по документам ***
    for (const doc_item of doc) {
      const docEntity = await toEntityDoc({
        dataSource: this.dataSource,
        val: doc_item,
        need_exist: true,
        need_actual: true,
      });

      // *** цикл по операциям ***
      for (const action of actions) {
        // валидность названия операции
        if (!(Object.values(ActionsDoc) as string[]).includes(action))
          customError(ACCESS_MSG.OPERATION_UNKNOWN);

        // список допустимых операций
        const actionList = await getAccessEnablingDoc({
          emp_id: emp_id,
          docEntity: docEntity,
        });

        // если операции нет в списке допустимых
        if (!actionList.includes(action)) {
          customError(ACCESS_MSG.OPERATION_DISABLED);
        }

        // ******************************************
        // ИНЫЕ УСЛОВИЯ БЛОКИРОВКИ ОПЕРАЦИИ
        // С ПОЯСНЕНИЯМИ БЛОКИРОВКИ
        // ******************************************

        /** КОРРЕСПОНДЕНТ */
        await accessValidDocCorr({
          args: args,
          dataSource: this.dataSource,
          docEntity: docEntity,
          action: action,
        });
      }
    }
  };
}
