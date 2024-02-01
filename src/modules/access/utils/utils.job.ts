import { DataSource } from "typeorm";
import { customError } from "../../../common/type/errorHelper.type";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { ExecJobEntity } from "../../../entity/#organization/job/jobExec.entity";

/**
 * ПОЛУЧИТЬ JobEntity
 * @param need_exist - должно быть задано
 * @param need_actual - должно быть актуально
 */
export const toEntityJob = async (args: {
  dataSource: DataSource;
  val: JobEntity | number;
  need_exist?: boolean;
  need_actual?: boolean;
}): Promise<JobEntity> => {
  const ERR_MSG = "Поручение не найдено";
  const { dataSource, val, need_exist = true, need_actual = true } = args;

  if (!val) {
    if (need_exist) customError(ERR_MSG);
    else return;
  }

  const jobEntity =
    val === Object(val)
      ? (val as JobEntity)
      : await dataSource.getRepository(JobEntity).findOne({
          where: {
            id: val as number,
            del: false,
          },
        });

  if (!jobEntity) {
    if (need_exist) customError(ERR_MSG);
    else return;
  }

  if (need_actual && (!jobEntity || jobEntity?.del)) customError(ERR_MSG);

  return jobEntity;
};

/**
 * ПОЛУЧИТЬ ExecJobEntity
 * @param need_exist - должно быть задано
 * @param need_actual - должно быть актуально
 */
export const toEntityExecJob = async (args: {
  dataSource: DataSource;
  val: ExecJobEntity | number;
  need_exist?: boolean;
  need_actual?: boolean;
}): Promise<ExecJobEntity> => {
  const ERR_MSG = "Не найден исполнитель поручения";
  const { dataSource, val, need_exist = true, need_actual = true } = args;

  if (!val) {
    if (need_exist && !val) customError(ERR_MSG);
    else return;
  }

  const execJobEntity =
    val === Object(val)
      ? (val as ExecJobEntity)
      : await dataSource.getRepository(ExecJobEntity).findOne({
          where: {
            id: val as number,
            del: false,
          },
        });

  if (!execJobEntity) {
    if (need_exist) customError(ERR_MSG);
    else return;
  }

  if (need_actual && (!execJobEntity || execJobEntity?.del)) customError(ERR_MSG);

  return execJobEntity;
};
