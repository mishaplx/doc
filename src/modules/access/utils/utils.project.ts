import { DataSource } from "typeorm";
import { customError } from "../../../common/type/errorHelper.type";
import { ProjectEntity } from "../../../entity/#organization/project/project.entity";

/**
 * ПОЛУЧИТЬ ProjectEntity
 * @param need_exist - должно быть задано
 * @param need_actual - должно быть актуально
 */
export const toEntityProject = async (args: {
  dataSource: DataSource;
  val: ProjectEntity | number;
  need_exist?: boolean;
  need_actual?: boolean;
}): Promise<ProjectEntity> => {
  const ERR_MSG = "Проект не найден";
  const { dataSource, val, need_exist = true, need_actual = true } = args;

  if (!val) {
    if (need_exist) customError(ERR_MSG);
    else return;
  }

  const projectEntity =
    val === Object(val)
      ? (val as ProjectEntity)
      : await dataSource.getRepository(ProjectEntity).findOne({
          where: {
            id: val as number,
            del: false,
          },
        });

  if (!projectEntity) {
    if (need_exist) customError(ERR_MSG);
    else return;
  }

  if (need_actual && (!projectEntity || projectEntity?.del)) customError(ERR_MSG);

  return projectEntity;
};
