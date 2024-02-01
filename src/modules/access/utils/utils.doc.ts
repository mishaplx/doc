import { DataSource } from "typeorm";
import { customError } from "../../../common/type/errorHelper.type";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";

/**
 * ПОЛУЧИТЬ DocEntity
 * @param need_exist - должно быть задано
 * @param need_actual - должно быть актуально
 */
export const toEntityDoc = async (args: {
  dataSource: DataSource;
  val: DocEntity | number;
  need_exist?: boolean;
  need_actual?: boolean;
}): Promise<DocEntity> => {
  const ERR_MSG = "Документ не найден";
  const { dataSource, val, need_exist = true, need_actual = true } = args;

  if (!val) {
    if (need_exist) customError(ERR_MSG);
    else return;
  }

  const docEntity =
    val === Object(val)
      ? (val as DocEntity)
      : await dataSource.getRepository(DocEntity).findOne({
          where: {
            id: val as number,
            del: false,
          },
        });

  if (!docEntity) {
    if (need_exist) customError(ERR_MSG);
    else return;
  }

  if (need_actual && (!docEntity || docEntity?.del)) customError(ERR_MSG);

  return docEntity;
};
