import { DataSource } from "typeorm";

import { ActionsDoc } from "../../../../BACK_SYNC_FRONT/actions/actions.doc";
import { customError } from "../../../../common/type/errorHelper.type";
import { DocEntity } from "../../../../entity/#organization/doc/doc.entity";
import { IAccessDocValid } from "./accessValid.doc";

// ******************************************
// ИНЫЕ УСЛОВИЯ БЛОКИРОВКИ ОПЕРАЦИИ
// С ПОЯСНЕНИЯМИ БЛОКИРОВКИ
// КОРРЕСПОНДЕНТ
// ******************************************
export const accessValidDocCorr = async (args2: {
  args: IAccessDocValid;
  dataSource: DataSource;
  docEntity: DocEntity;
  action: string;
}): Promise<void> => {
  const { args, dataSource, docEntity, action } = args2;
  const { args_parsed, args_origin } = args;

  // *** КОРРЕСПОНДЕНТ: ДОБАВИТЬ
  if (action == ActionsDoc.DOC_CORR_ADD) {
    const corr_new = args_origin?.correspondentItem;
    const correspondentEntityList = (await docEntity.Correspondent).filter(
      (item) =>
        item.del == false &&
        item.doc_id == corr_new?.doc_id &&
        item.delivery_id == corr_new?.delivery_id &&
        ((item.org && item.org == corr_new?.org_id) ||
          (item.citizen_id && item.citizen_id == corr_new?.citizen_id)),
    );
    if (correspondentEntityList.length > 0)
      customError("Нельзя одному корреспонденту назначить несколько доставок");
  }
};
