import { UnprocessableEntityException } from "@nestjs/common";

import { In, QueryRunner, Repository } from "typeorm";

import { PREF_ERR } from "../../../common/enum/enum";
import { JobStatus } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { IWhereFindAllJobControl } from "../../../common/interfaces/jobcontrol.interface";
import { JobControlEntity } from "../../../entity/#organization/job/jobControl.entity";
import { GetJobControlArgs } from "./dto/get-jobcontrol.args";

export function getWhereFindAll(args: GetJobControlArgs): IWhereFindAllJobControl {
  const where: IWhereFindAllJobControl = {};
  const { ids, jobId } = args;

  if (ids?.[0]) {
    where.id = In(ids);
  }

  if (jobId) {
    where.job_id = jobId;
  }

  return where;
}

export function checkAccessCreateJobControl(countJobControl: number): void {
  if (countJobControl) {
    throw new UnprocessableEntityException(PREF_ERR + "Контроль по поручению уже существует.");
  }
}

export function checkAccessUpdateJobControl(
  maxJobControlId: number,
  jobControlId: number,
  jobStatusId: number,
  newDatePlan: Date,
  oldDatePlan: Date,
): void {
  if (maxJobControlId !== jobControlId) {
    throw new UnprocessableEntityException(
      PREF_ERR + "Редактировать можно последнюю запись по контролю.",
    );
  }

  if (jobStatusId === JobStatus.CLOSED) {
    throw new UnprocessableEntityException(
      PREF_ERR +
        "Вкладка «Контроль» доступна для редактирования на всех этапах жизни поручения, кроме статуса «Закрыто».",
    );
  }

  if (typeof newDatePlan !== "undefined" && newDatePlan.getTime() !== oldDatePlan.getTime()) {
    if (jobStatusId > JobStatus.APPROVED) {
      throw new UnprocessableEntityException(
        PREF_ERR +
          "После отправки поручения на исполнение «плановую дату» можно изменить только используя кнопку «Продлить срок».",
      );
    }
  }
}

export function checkAccessDeleteJobControl(jobStatusId: number): void {
  if (jobStatusId > JobStatus.APPROVED) {
    throw new UnprocessableEntityException(
      PREF_ERR + "Удалить данные по контролю можно до отправки поручения на исполнение.",
    );
  }
}

/**
 * Получение id последнего контроля по поручению
 * FIXME: ИСПОЛЬЗОВАТЬ await jobEntity.JobControlLast
 * @deprecated
 */
export async function getLastJobControlId(
  repository: Repository<JobControlEntity>,
  jobId: number,
  queryRunner?: QueryRunner,
): Promise<number> {
  const { maxJobControlId } = await repository
    .createQueryBuilder("", queryRunner)
    .select("MAX(id):: int", "maxJobControlId")
    .where({ job_id: jobId })
    .getRawOne();

  return maxJobControlId;
}
