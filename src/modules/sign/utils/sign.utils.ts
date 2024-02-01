import { EntityManager } from "typeorm";
import { customError } from "../../../common/type/errorHelper.type";
import { SignEntity } from "../../../entity/#organization/sign/sign.entity";

export interface ISignAdd {
  manager: EntityManager;
  sign: string;
  emp_id?: number;
  file_item_id?: number;
  project_id?: number;
  doc_id?: number;
  job_id?: number;
  inventory_id?: number;
  date_create?: Date;
}

/********************************************
 * ЭЦП: добавить подпись
 * @param sign - ЭЦП в PEM-формате
 ********************************************/
export const signAddUtil = async ({
  manager,
  sign,
  emp_id = null,
  file_item_id = null,
  project_id = null,
  doc_id = null,
  job_id = null,
  inventory_id = null,
  date_create,
}: ISignAdd): Promise<SignEntity> => {
  // должна быть привязка подписи к объекту
  let i = 0;
  if (file_item_id) i++;
  if (project_id) i++;
  if (doc_id) i++;
  if (job_id) i++;
  if (inventory_id) i++;
  if (i != 1) {
    customError("Подпись должна быть связана только с одним объектом");
  }

  const signEntity = await manager.create(SignEntity, {
    sign: sign,
    emp_id: emp_id,
    file_item_id: file_item_id,
    project_id: project_id,
    doc_id: doc_id,
    job_id: job_id,
    // inventory_id: inventory_id,
    date_create: date_create ?? new Date(),
    task_verify: true,
  });
  return await manager.save(SignEntity, signEntity);
};
