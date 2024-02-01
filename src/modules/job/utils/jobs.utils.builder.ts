import { Brackets, SelectQueryBuilder, WhereExpressionBuilder } from "typeorm";

import { JobStatus } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { SortEnum } from "../../../common/enum/enum";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { GetJobsArgs } from "../dto/get-jobs.args";
import { OrderJobsInput } from "../dto/order-jobs-request.dto";
import { OrderJobsEnum, PartiesJobs, TabsJobs } from "../job.const";

export function setQueryBuilderJob(
  args: GetJobsArgs,
  empId: number,
  orderBy: OrderJobsInput,
  queryBuilder: SelectQueryBuilder<JobEntity>,
): void {
  const {
    ids,
    docId,
    flagStatus,
    user,
    overdue,
    termExpires,
    waitingControl,
    waitingPreControl,
    dtc,
    body,
    executor,
    author,
    status,
    jobControl,
    nameDocInJob,
    executionDate,
    factDate,
    num,
    mainJob,
    typeJob,
  } = args;

  let filterForParentJob = "";
  if (user && user[0]) {
    const userFilter = [];
    user.map((role) => {
      switch (role) {
        case PartiesJobs.AUTHOR:
          userFilter.push(`"a"."author_id" = ${empId}`);
          break;
        case PartiesJobs.EXECUTOR:
          userFilter.push(`"b"."emp_id" = ${empId}`);
          break;
        case PartiesJobs.CREATED:
          userFilter.push(`"a".user_created_id = ${empId}`);
          break;
        case PartiesJobs.CONTROLLER:
          userFilter.push(`"c"."controller_id" = ${empId}`);
          break;
        case PartiesJobs.PREV_CONTROLLER:
          userFilter.push(`"c"."prev_controller_id" = ${empId}`);
          break;
      }
    });

    filterForParentJob = userFilter.join(" OR ");
    filterForParentJob = filterForParentJob ? `AND (${filterForParentJob})` : filterForParentJob;
  }

  if (waitingControl) {
    filterForParentJob = `AND "a".status_id = ${JobStatus.ON_CONTROL} ${filterForParentJob}`;
  }
  if (waitingPreControl) {
    filterForParentJob = `AND "a".status_id = ${JobStatus.ON_PRECONTROL} ${filterForParentJob}`;
  }
  if (termExpires) {
    filterForParentJob = `AND "a".execution_date BETWEEN :start AND :end ${filterForParentJob}`;
  }
  if (overdue) {
    filterForParentJob = `AND "a".execution_date < current_timestamp ${filterForParentJob}`;
  }
  if (mainJob) {
    filterForParentJob = `AND "a"."status_id" NOT IN (${JobStatus.CLOSED}, ${JobStatus.FULFILLED}) ${filterForParentJob}`;
  }

  const { start, end } = getDateBetweenForTermExpires();
  // Временная таблица, в ней отображаются доступные по RLS Parentjob
  queryBuilder.addCommonTableExpression(
    `
    SELECT a.id,
           a.main_job_id,
           a.parent_job_id,
           a.status_id,
           a.author_id,
           a.user_created_id,
           a.execution_date,
           b.emp_id "exec_emp_id",
           c.controller_id "controller_id",
           c.prev_controller_id "prev_controller_id"
        FROM "sad"."jobs" a
        LEFT JOIN sad.exec_job b ON "a".id = b.job_id AND b.del = false
        LEFT JOIN sad.job_control c ON "a".id = c.job_id
        WHERE "a"."del" = false AND "a"."temp" = false ${filterForParentJob}`,
    "s1",
  );
  queryBuilder.leftJoinAndSelect("s1", "parentJob", '"parentJob"."id" = job.parent_job_id');
  queryBuilder.leftJoinAndSelect("s1", "mainJob", '"mainJob"."id" = job.main_job_id');
  queryBuilder.leftJoinAndSelect("job.Exec_job", "Exec_job", "Exec_job.del = false");
  queryBuilder.leftJoinAndSelect("Exec_job.Controller", "Controller");
  queryBuilder.leftJoinAndSelect("Controller.User", "E_user");
  queryBuilder.leftJoinAndSelect("E_user.Staff", "E_staff");
  queryBuilder.leftJoinAndSelect("Controller.post", "E_post");
  queryBuilder.leftJoinAndSelect("job.Author", "Author");
  queryBuilder.leftJoinAndSelect("Author.User", "A_user");
  queryBuilder.leftJoinAndSelect("A_user.Staff", "A_staff");
  queryBuilder.leftJoinAndSelect("Author.post", "A_post");
  queryBuilder.leftJoinAndSelect("job.JobControl", "JobControl");
  queryBuilder.leftJoinAndSelect("job.TypeJob", "TypeJob");
  queryBuilder.leftJoinAndSelect("JobControl.JobControlType", "JobControlType");
  queryBuilder.leftJoinAndSelect("job.Status", "Status");

  queryBuilder.where("job.del = :del", { del: false });
  queryBuilder.andWhere("job.temp = :temp", { temp: false });

  if (ids?.[0]) {
    queryBuilder.andWhere("job.id IN (:...ids)", { ids });
  }

  if (docId) {
    queryBuilder.andWhere("job.doc_id = :docId", { docId });
  }

  if (flagStatus !== TabsJobs.ALL) {
    setWhereByStatus(queryBuilder, flagStatus);
  }

  if (overdue) {
    queryBuilder.andWhere("job.execution_date < :date", { date: new Date() });
  }

  if (typeJob) {
    queryBuilder.andWhere("job.type_job = :typeJob", {
      typeJob,
    });
  }

  if (termExpires) {
    queryBuilder.andWhere("job.execution_date BETWEEN :start AND :end", {
      start,
      end,
    });
  }

  if (dtc) {
    const { start, end } = getStartEndForBetween(dtc);
    queryBuilder.andWhere("job.dtc BETWEEN :dtcStart AND :dtcEnd", {
      dtcStart: start,
      dtcEnd: end,
    });
  }

  if (executionDate) {
    const { start, end } = getStartEndForBetween(executionDate);
    queryBuilder.andWhere("job.execution_date BETWEEN :edStart AND :edEnd", {
      edStart: start,
      edEnd: end,
    });
  }

  if (factDate) {
    const { start, end } = getStartEndForBetween(factDate);
    queryBuilder.andWhere("job.fact_date BETWEEN :fdStart AND :fdEnd", {
      fdStart: start,
      fdEnd: end,
    });
  }

  if (body) {
    queryBuilder.andWhere("job.body ILIKE :body", { body: `%${body}%` });
  }

  if (executor) {
    queryBuilder.andWhere(
      `(E_staff.ln || ' ' || substring(E_staff.nm for 1) || '.' || CONCAT(substring(E_staff.mn for 1)) || '. / ' || E_post.nm) ILIKE :executor`,
      {
        executor: `%${executor}%`,
      },
    );
  }

  if (author) {
    queryBuilder.andWhere(
      `(A_staff.ln || ' ' || substring(A_staff.nm for 1) || '.' || CONCAT(substring(A_staff.mn for 1)) || '. / ' || A_post.nm) ILIKE :author`,
      {
        author: `%${author}%`,
      },
    );
  }

  if (status) {
    queryBuilder.andWhere("job.status_id = :status", { status });
  }

  if (waitingControl) {
    queryBuilder.andWhere("job.status_id = :status", { status: JobStatus.ON_CONTROL });
  }

  if (waitingPreControl) {
    queryBuilder.andWhere("job.status_id = :status", { status: JobStatus.ON_PRECONTROL });
  }

  if (jobControl) {
    queryBuilder.andWhere("JobControl.job_control_type_id = :jobControl", {
      jobControl,
    });
  }

  if (nameDocInJob) {
    queryBuilder.andWhere("job.name_doc_in_job ILIKE :nameDocInJob", {
      nameDocInJob: `%${nameDocInJob}%`,
    });
  }

  if (num) {
    queryBuilder.andWhere("job.num ILIKE :num", {
      num: `%${num}%`,
    });
  }

  if (mainJob) {
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where(
          '("job".main_job_id ISNULL OR ("job".main_job_id NOTNULL AND "mainJob".id ISNULL AND "job".id = (SELECT min("s1".id) FROM "s1" WHERE "s1".main_job_id = "job".main_job_id)))',
        );
        qb.andWhere("(job.parent_job_id ISNULL");
        qb.orWhere(
          `(job.parent_job_id NOTNULL AND "parentJob"."parent_job_id" ISNULL AND "parentJob"."id" ISNULL))`,
        );
      }),
    );
  }

  if (user && user[0]) {
    queryBuilder.andWhere(new Brackets((qb) => setUserRole(qb, user, empId)));
  }

  getOrderAllJobs(queryBuilder, orderBy);
}

/**
 * Получить начальную и конечную дату для поиска
 */
function getStartEndForBetween(date): any {
  const start = date;
  const end = new Date(start.getTime());
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Получить начальную и конечную дату для определения, не истекает ли срок исполнения
 */
export function getDateBetweenForTermExpires(): any {
  const start = new Date();
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 3);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Фильтр по вкладкам поручения.
 *
 * Вкладка «В работе» - Отображаются поручения в статусах отличных от «Закрыто».
 * Вкладка «Завершенные» - Отображаются поручения, имеющие статус «Закрыто».
 * Вкладка «Все» - Отображаются все поручения.
 */
function setWhereByStatus(queryBuilder: SelectQueryBuilder<JobEntity>, flagStatus: number): void {
  switch (flagStatus) {
    case TabsJobs.CLOSED:
      queryBuilder.andWhere("(job.status_id = :statusId OR job.status_id = :statusfull)", {
        statusId: JobStatus.CLOSED,
        statusfull: JobStatus.FULFILLED,
      });
      break;
    case TabsJobs.IN_PROGRESS:
      queryBuilder.andWhere(`job.status_id NOT IN (${JobStatus.CLOSED}, ${JobStatus.FULFILLED})`);
      break;
  }
}

function setUserRole(qb: WhereExpressionBuilder, user: PartiesJobs[], userId: number): void {
  user.map((role) => {
    switch (role) {
      case PartiesJobs.AUTHOR:
        qb.orWhere("job.author_id = :userId", { userId });
        break;
      case PartiesJobs.EXECUTOR:
        qb.orWhere("Exec_job.emp_id = :userId", { userId });
        break;
      case PartiesJobs.CREATED:
        qb.orWhere("job.user_created_id = :userId", { userId });
        break;
      case PartiesJobs.CONTROLLER:
        qb.orWhere("JobControl.controller_id = :userId", { userId });
        break;
      case PartiesJobs.PREV_CONTROLLER:
        qb.orWhere("JobControl.prev_controller_id = :userId", { userId });
        break;
    }
  });
}

function getOrderAllJobs(
  queryBuilder: SelectQueryBuilder<JobEntity>,
  orderBy: OrderJobsInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("job.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderJobsEnum.ids:
      queryBuilder.orderBy("job.id", orderBy.sortEnum);
      break;
    case OrderJobsEnum.dtc:
      queryBuilder.orderBy("job.dtc", orderBy.sortEnum);
      break;
    case OrderJobsEnum.body:
      queryBuilder.orderBy("job.body", orderBy.sortEnum);
      break;
    case OrderJobsEnum.executor:
      queryBuilder.orderBy({
        "E_staff.ln": orderBy.sortEnum,
        "E_staff.nm": orderBy.sortEnum,
        "E_staff.mn": orderBy.sortEnum,
        "E_post.nm": orderBy.sortEnum,
      });
      break;
    case OrderJobsEnum.executionDate:
      queryBuilder.orderBy("job.execution_date", orderBy.sortEnum);
      break;
    case OrderJobsEnum.author:
      queryBuilder.orderBy({
        "A_staff.ln": orderBy.sortEnum,
        "A_staff.nm": orderBy.sortEnum,
        "A_staff.mn": orderBy.sortEnum,
        "A_post.nm": orderBy.sortEnum,
      });
      break;
    case OrderJobsEnum.status:
      queryBuilder.orderBy("Status.nm", orderBy.sortEnum);
      break;
    case OrderJobsEnum.typeJob:
      queryBuilder.orderBy("TypeJob.nm", orderBy.sortEnum);
      break;
    case OrderJobsEnum.factDate:
      queryBuilder.orderBy("job.fact_date", orderBy.sortEnum);
      break;
    case OrderJobsEnum.jobControl:
      queryBuilder.orderBy("JobControlType.nm", orderBy.sortEnum);
      break;
    case OrderJobsEnum.nameDocInJob:
      queryBuilder.orderBy("job.name_doc_in_job", orderBy.sortEnum);
      break;
    case OrderJobsEnum.num:
      queryBuilder.orderBy("job.num", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("job.id", SortEnum.DESC);
  }
}
