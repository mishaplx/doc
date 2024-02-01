import { ActionsDoc } from "src/BACK_SYNC_FRONT/actions/actions.doc";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";
import { ACCESS_STATUS_DOC } from "../const/status/status.doc";
import { delActions } from "../utils/utils";
import { DeliveryEnum } from "../../doc/doc.const";

/**
 * ДОКУМЕНТЫ: ДОПУСТИМЫЕ ОПЕРАЦИИ
 */
export const getAccessEnablingDoc = async (args: {
  emp_id: number;
  docEntity: DocEntity;
}): Promise<string[]> => {
  const { emp_id, docEntity } = args;

  // разрешенные операции для статуса
  let ret = Object.keys(ACCESS_STATUS_DOC).filter((item) =>
    ACCESS_STATUS_DOC[item].includes(docEntity.docstatus),
  );

  // // является ли emp админом
  // const empEntity = await dataSource.getRepository(EmpEntity).findOneBy({ id: emp_id, del: false });
  // if (!empEntity) customError('Не найдено назначение');

  // // если не админ
  // if (!empEntity.is_admin) {
  // }

  // ===============================
  // ОТПРАВКА
  // ===============================
  const deliveryIdList = (await docEntity.Correspondent)?.map(x => x.delivery_id);
  // запретить отправку по EMail и СМДО если в списке адресатов нет соответствующего метода
  if (!deliveryIdList?.includes(DeliveryEnum.EMAIL)) {
    ret = delActions(ret, [ ActionsDoc.DOC_SEND_EMAIL ]);
  }
  if (!deliveryIdList?.includes(DeliveryEnum.SMDO)) {
    ret = delActions(ret, [ ActionsDoc.DOC_SEND_SMDO ]);
  }

  return ret;
};
