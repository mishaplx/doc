import { Inject, Injectable } from "@nestjs/common";
import { EntityManager, IsNull } from "typeorm";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

import { JobLoopKindEnum, JobStatus } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { customError } from "../../../common/type/errorHelper.type";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { ExecJobEntity } from "../../../entity/#organization/job/jobExec.entity";
import { JobLoopEntity } from "../../../entity/#organization/job/jobLoop.entity";
import { CreateExecDto } from "../dto/createExec.dto";
import { JobControlService } from "../jobControl/jobControl.service";
import { JobExecutorService } from "../jobExecutor/jobExecutor.service";
import { JobsService } from "../job.service";
import { JobLoopParamDtoSet } from "./jobLoop.dto";
import { getJobLoopDates } from "./jobLoop.utils";
import { JOB } from "../job.const";

const ERR = "Периодчность поручений: ошибка ";
dayjs.extend(advancedFormat);

@Injectable()
export class JobLoopService {
  @Inject(JobsService)
  private readonly jobsService: JobsService;
  constructor(
    @Inject(JobExecutorService) private readonly jobExecutorService: JobExecutorService,
    @Inject(JobControlService) private readonly jobControlService: JobControlService,
  ) {}

  /**
   * Периодичные поручения: создать серию подпоручений
   */
  async createJobLoop(args: {
    manager?: EntityManager;
    emp_id: number;
    job_id: number;
  }): Promise<JobEntity[]> {
    const { manager, ...argOther } = args;
    // runnerManager({
    //   manager: manager,
    //   dataSource: this.jobsService.dataSource,
    //   fun: this.createJobLoopManager,
    //   // emp_id: number,
    //   // job_id: number,
    // });

    return manager
      ? await this.createJobLoopManager({
          manager,
          ...argOther,
        })
      : await this.jobsService.dataSource.transaction(
          async (manager) =>
            await this.createJobLoopManager({
              manager,
              ...argOther,
            }),
        );
  }

  async createJobLoopManager(args: {
    manager: EntityManager;
    emp_id: number;
    job_id: number;
  }): Promise<JobEntity[]> {
    try {
      const { manager, emp_id, job_id } = args;
      const jobEntity = await manager.findOneBy(JobEntity, {
        id: job_id,
        del: false,
        temp: false,
      });
      if (!jobEntity) customError("Не найдено поручение");
      const jobLoopEntity = await jobEntity.JobLoop;
      if (!jobLoopEntity) customError("Не найдены параметры периодичности поручения");

      // допустимость операции
      // проверяется в @Access
      // if (!jobLoopEntity) customError("Параметры периодичности не заданы");
      // if (jobLoopEntity.done) customError("Периодичность установлена ранее");

      // список исполнителей
      const execJobList: CreateExecDto[] = [];
      for (const execJobEntity of await manager.findBy(ExecJobEntity, {
        job_id: job_id,
        del: false,
        date_end: IsNull(),
      })) {
        execJobList.push({
          job_id: undefined, // заполнить ниже
          emp_id: execJobEntity.emp_id,
          date_assign: execJobEntity.date_assign,
          note: execJobEntity.note,
        });
      }

      // ответственный исполнитель, контролер, предконтролер
      const responsible_emp_id = (await jobEntity.HistoryResponsibleActual)?.emp_id;

      // контроль
      const jobControlEntity = await jobEntity.JobControlLast;

      // ограничение по количеству подпоручений
      const jobLoopDates = await getJobLoopDates(jobLoopEntity);
      if (jobLoopDates?.length > JOB.LOOP_MAX) {
        customError("Количество повторений не должно быть более "+JOB.LOOP_MAX);
      }

      // создать подпоручение: цикл по списку плановых дат
      let iter = 1;
      for (const loopDate of jobLoopDates) {
        const jobEntityChild = (await this.jobsService.createChildrenJob({
          manager: manager, // задать обязательно
          emp_id: emp_id,
          job_id: job_id,
        })) as JobEntity;
        jobEntityChild.temp = false;
        jobEntityChild.status_id = JobStatus.APPROVED;

        // добавить новые значения
        jobEntityChild.num = jobEntity.num + "/" + iter++;
        jobEntityChild.body = jobEntity.body;
        jobEntityChild.type_job = jobEntity.type_job;
        jobEntityChild.loop = true;
        jobEntityChild.execution_date = loopDate;

        await manager.save(JobEntity, jobEntityChild);

        // добавить исполнителей
        if (execJobList.length > 0) {
          for (const execJobItem of execJobList) {
            execJobItem.job_id = jobEntityChild.id;
          }
          await this.jobExecutorService.addExecutor({
            manager: manager,
            emp_id: emp_id,
            execJobList: execJobList,
            is_valid: false, // т.к. проверка осуществляется ВНЕ транзакции
            responsible_emp_id: responsible_emp_id,
          });
        }

        // добавить контроль и предконтроль
        if (jobControlEntity) {
          await this.jobControlService.createManager({
            manager: manager,
            createJobControlInput: {
              job_id: jobEntityChild.id,
              job_control_type_id: jobControlEntity.job_control_type_id,
              controller_id: jobControlEntity.controller_id,
              prev_controller_id: jobControlEntity.prev_controller_id,
              date_plan: loopDate,
            },
          });
        }
      }

      // установить признаки установленной периодичности
      jobLoopEntity.done = true;
      await manager.save(JobLoopEntity, jobLoopEntity);

      return await manager.findBy(JobEntity, {
        parent_job_id: job_id,
        loop: true,
        del: false,
        temp: false,
      });
    } catch (err) {
      customError(ERR + "создания серии поручений", err);
    }
  }

  /**
   * Периодичные поручения: установить параметры
   */
  async setJobLoopParam(job_id: number, param: JobLoopParamDtoSet): Promise<JobLoopEntity> {
    try {
      // допустимость параметров
      if (!param.end_date && !param.end_count) {
        customError("На задано условие завершения периодичности");
      }
      if (param.loop_kind == JobLoopKindEnum.month && !param.loop_month_type) {
        customError("На заданы повторы для месяца");
      }
      if (param.end_count && param.end_count > JOB.LOOP_MAX) {
        customError("Количество повторений не должно быть более "+JOB.LOOP_MAX);
      }
      if (
        param.loop_kind == JobLoopKindEnum.week &&
        !(
          param.loop_week_1 ||
          param.loop_week_2 ||
          param.loop_week_3 ||
          param.loop_week_4 ||
          param.loop_week_5 ||
          param.loop_week_6 ||
          param.loop_week_7
        )
      ) {
        customError("На заданы дни недели");
      }
      // // если отключить: тогда что быстрее наступит
      // if (param.end_date && param.end_count) {
      //   customError("Недопустима одновременная установка двух условий периодичности");
      // }

      return await this.jobsService.dataSource.transaction(async (manager) => {
        const jobEntity = await manager.findOneBy(JobEntity, {
          id: job_id,
          del: false,
          temp: false,
        });
        if (!jobEntity) customError("Не найдено поручение");

        const jobLoopEntity = await manager.findOneBy(JobLoopEntity, { job_id: job_id });
        if (jobLoopEntity) {
          // допустимость операции
          if (jobLoopEntity.done)
            customError("После установки периодичности изменение параметров не допускается");
          // удалить старую запись периодичности
          await manager.delete(JobLoopEntity, { job_id: job_id });
        }

        // установить данные новой записи
        const jobLoopNew = new JobLoopEntity();
        for (const key of Object.keys(param)) {
          jobLoopNew[key] = param[key];
        }
        return await manager.save(JobLoopEntity, jobLoopNew);
      });
    } catch (err) {
      customError(ERR + "записи параметров", err);
    }
  }

  /**
   * Периодичные поручения: прочитать параметры
   */
  async getJobLoopParam(job_id: number): Promise<JobLoopEntity> {
    try {
      return await this.jobsService.dataSource.manager.findOneBy(JobLoopEntity, { job_id: job_id });
    } catch (err) {
      customError(ERR + "чтения параметров", err);
    }
  }
}
