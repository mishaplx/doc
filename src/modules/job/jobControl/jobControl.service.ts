import { HttpException, Inject, Injectable, UseGuards } from "@nestjs/common";
import { DataSource, EntityManager, QueryRunner, Repository } from "typeorm";

import { PsBaseEnum } from "../../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { JobStatus } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { jobControl } from "./jobControl.const";
import { customError, httpExceptErr, setErrorGQL } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { getDataSourceAdmin } from "../../../database/datasource/tenancy/tenancy.utils";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { JobControlEntity } from "../../../entity/#organization/job/jobControl.entity";
import { JobProlongRequestEntity } from "../../../entity/#organization/job/jobProlongRequest.entity";
import { getPaginatedData, paginatedResponseResult } from "../../../pagination/pagination.service";
import { PaginationInput } from "../../../pagination/paginationDTO";
import { NotifyTypeEnum } from "../../notify/notify.const";
import { NotifyOrgService } from "../../notify/org/notifyOrg.service";
import {
  JobEmpEnum,
  NotifyOrgJobService,
  addNotifyJobAnyNum,
} from "../../notify/org/notifyOrgJob.service";
import { jobFinalize } from "../utils/jobs.utils.finalize";
import { CreateJobControlInput } from "./dto/create-jobcontrol.input";
import { GetJobControlArgs } from "./dto/get-jobcontrol.args";
import { PaginatedJobControlResponse } from "./dto/paginated-jobcontrol-response.dto";
import { ProlongTheJobInput } from "./dto/prolong-the-job.input";
import { ReturnToExecJobControlInput } from "./dto/return-to-exec-jobcontrol.input";
import { UpdateJobControlInput } from "./dto/update-jobcontrol.input";
import {
  checkAccessCreateJobControl,
  checkAccessDeleteJobControl,
  checkAccessUpdateJobControl,
  getLastJobControlId,
  getWhereFindAll,
} from "./jobControls.utils";

@UseGuards(PoliceGuard)
@Injectable()
export class JobControlService {
  private readonly jobControlRepository: Repository<JobControlEntity>;
  private readonly jobRepository: Repository<JobEntity>;

  private readonly CONTROLLER_RESULT_GETOUTOFCONTROL: string =
    jobControl.CONTROLLER_RES_GETOUTOFCONTROL;
  private readonly CONTROLLER_RESULT_PROLONGTHEJOB: string =
    jobControl.CONTROLLER_RES_PROLONGTHEJOB;
  private readonly CONTROLLER_RESULT_REFUSALTORENEW: string =
    jobControl.CONTROLLER_RES_REFUSALTORENEW;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
    @Inject(NotifyOrgJobService) private readonly notifyOrgJobService: NotifyOrgJobService,
  ) {
    this.jobControlRepository = dataSource.getRepository(JobControlEntity);
    this.jobRepository = dataSource.getRepository(JobEntity);
  }

  /**
   * КОНТРОЛЬ: СОЗДАТЬ
   */
  async create(args: {
    manager?: EntityManager;
    createJobControlInput: CreateJobControlInput;
  }): Promise<JobControlEntity | HttpException> {
    const { manager, ...argOther } = args;
    return manager
      ? await this.createManager({
          manager,
          ...argOther,
        })
      : await this.dataSource.transaction(
          async (manager) =>
            await this.createManager({
              manager,
              ...argOther,
            }),
        );
  }
  async createManager(args: {
    manager: EntityManager;
    createJobControlInput: CreateJobControlInput;
  }): Promise<JobControlEntity | HttpException> {
    try {
      const { manager, createJobControlInput } = args;

      // запомнить emp-статусы по поручению
      const notify = await this.notifyOrgJobService.memoNotifyJobStatus({
        job_id: createJobControlInput.job_id,
        manager: manager,
      });

      const countJobControl = await manager.countBy(JobControlEntity, {
        job_id: createJobControlInput.job_id,
      });

      checkAccessCreateJobControl(countJobControl);
      const newJobControl = manager.create(JobControlEntity, createJobControlInput);
      const { id, job_id } = await manager.save(JobControlEntity, newJobControl);
      await manager.findOneByOrFail(JobControlEntity, { id });
      //установка плановой даты
      await await manager.update(JobEntity, job_id, {
        execution_date: createJobControlInput.date_plan,
      });

      // уведомления об изменении статусов
      await this.notifyOrgJobService.addNotifyJobStatus({
        memo: notify,
        job_emp: [JobEmpEnum.control_all],
      });

      return await manager.findOneByOrFail(JobControlEntity, { id });
    } catch (err) {
      return setErrorGQL("Ошибка создания контроля", err);
    }
  }

  async findAll(
    args: GetJobControlArgs,
    pagination: PaginationInput,
  ): Promise<PaginatedJobControlResponse> {
    const where = getWhereFindAll(args);
    const { pageNumber, pageSize, All } = pagination;

    const [jobControl, total] = await getPaginatedData(
      this.jobControlRepository,
      pageNumber,
      pageSize,
      where,
      All,
    );

    return paginatedResponseResult(jobControl, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<JobControlEntity> {
    return this.jobControlRepository.findOneBy({ id });
  }

  /**
   * КОНТРОЛЬ: ИЗМЕНИТЬ
   */
  async update(
    id: number,
    updateJobControlInput: UpdateJobControlInput,
  ): Promise<JobControlEntity> {
    const jobControl = await this.jobControlRepository.findOneByOrFail({ id });

    const { status_id: jobStatusId } = await this.jobRepository.findOneByOrFail({
      id: jobControl.job_id,
    });
    const maxJobControlId = await getLastJobControlId(this.jobControlRepository, jobControl.job_id);

    // запомнить emp-статусы по поручению
    const notify = await this.notifyOrgJobService.memoNotifyJobStatus({
      job_id: jobControl.job_id,
      manager: this.dataSource.manager,
    });

    checkAccessUpdateJobControl(
      maxJobControlId,
      Number(jobControl.id),
      jobStatusId,
      updateJobControlInput.date_plan,
      jobControl.date_plan,
    );

    await this.jobControlRepository.update(id, updateJobControlInput);
    //установка плановой даты
    await this.jobRepository.update(updateJobControlInput.job_id, {
      execution_date: updateJobControlInput.date_plan,
    });

    // уведомления об изменении статусов
    await this.notifyOrgJobService.addNotifyJobStatus({
      memo: notify,
      job_emp: [JobEmpEnum.control_all],
    });

    return this.jobControlRepository.findOneByOrFail({ id });
  }

  /**
   * КОНТРОЛЬ: УДАЛИТЬ КОНТРОЛЕРА
   */
  async delete(jobId: number): Promise<boolean> {
    // запомнить emp-статусы по поручению
    const notify = await this.notifyOrgJobService.memoNotifyJobStatus({
      job_id: jobId,
      manager: this.dataSource.manager,
    });

    const jobEntity = await this.jobRepository.findOneByOrFail({ id: jobId });
    const { status_id: jobStatusId } = jobEntity;
    const jobControlEntity = await jobEntity.JobControlLast;

    checkAccessDeleteJobControl(jobStatusId);

    const { affected } = await this.jobControlRepository.delete({
      job_id: jobId,
    });
    await this.jobRepository.update({ id: jobId }, { execution_date: null });

    // уведомления об изменении статусов
    await this.notifyOrgJobService.addNotifyJobStatus({
      memo: notify,
      job_emp: [JobEmpEnum.control_all],
    });

    return !!affected;
  }

  /**
   * КОНТРОЛЬ: СНЯТЬ С КОНТРОЛЯ
   */
  async getOutOfControl(args: { job_id: number }): Promise<boolean | HttpException> {
    try {
      // источник данных с ПРАВАМИ АДМИНА: необходимость выполнения операций в отношении невидимых поручений
      const dataSourceAdmin = await getDataSourceAdmin(this.dataSource.options.database as string);

      // операция разрешена если есть RLS-доступ к основному поручению
      const jobEntity = await this.dataSource.manager.findOneBy(JobEntity, {
        id: args.job_id,
        del: false,
      });
      if (!jobEntity) customError("Поручение не найдено");

      await dataSourceAdmin.transaction(async (manager) => {
        await jobFinalize({
          manager: manager,
          job_id: args.job_id,
        });
      });

      // уведомление заинтересованным
      await this.notifyOrgJobService.addNotifyJobAny({
        job_id: args.job_id,
        notify_type_id: NotifyTypeEnum.JOB_RESOLV_CONTROL_OFF,
        message: "Поручение № " + addNotifyJobAnyNum + ": снято с контроля",
      });

      return true;
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  /**
   * КОНТРОЛЬ: ВОЗВРАТ НА ИСПОЛНЕНИЕ
   */
  async returnToExec(returnToExecJobControlInput: ReturnToExecJobControlInput): Promise<boolean> {
    // Проверка на контролёра. Ф-ция доступна контролёру

    const { jobId, reason } = returnToExecJobControlInput;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Поручение изменило статус на «Возвращено на исполнение».
      await queryRunner.manager.update(
        JobEntity,
        {
          id: jobId,
        },
        { status_id: JobStatus.RETURNED_FOR_EXECUTION },
      );

      const maxJobControlId = await getLastJobControlId(
        this.jobControlRepository,
        jobId,
        queryRunner,
      );

      // Текст возврата отображается во вкладке «Контроль» в поле «Результат контроля».
      await queryRunner.manager.update(
        JobControlEntity,
        {
          id: maxJobControlId,
        },
        {
          controller_result: reason,
        },
      );

      // Во вкладке «Контроль», на основе базовой записи,
      // создается новая запись с пустыми полями «Результат предконтроля» и «Результат контроля».
      const baseJobControl = await queryRunner.manager.findOneByOrFail(JobControlEntity, {
        id: maxJobControlId,
      });

      delete baseJobControl.id;
      delete baseJobControl.prev_controller_result;
      delete baseJobControl.controller_result;

      await queryRunner.manager.save(JobControlEntity, baseJobControl);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customError(error.message);
    } finally {
      await queryRunner.release();
    }

    // уведомление
    await this.notifyOrgJobService.addNotifyJobAny({
      job_id: jobId,
      job_emp: [
        JobEmpEnum.creator,
        JobEmpEnum.author,
        JobEmpEnum.exec_simple,
        JobEmpEnum.exec_respons,
        JobEmpEnum.control_pre,
      ],
      notify_type_id: NotifyTypeEnum.JOB_RESOLV_REEXEC,
      message: "Поручение № " + addNotifyJobAnyNum + ": возвращено на исполнение",
      kind: PsBaseEnum.error,
    });

    return true;
  }

  /**
   * КОНТРОЛЬ: ПРОДЛИТЬ СРОК
   */
  async prolongTheJob(prolongTheJobInput: ProlongTheJobInput): Promise<boolean> {
    // Проверка на контролёра. Ф-ция доступна контролёру

    const { jobId, comment, datePlan } = prolongTheJobInput;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const maxJobControlId = await getLastJobControlId(
        this.jobControlRepository,
        jobId,
        queryRunner,
      );

      // проставить отметку в запросе на продление
      await queryRunner.manager.update(
        JobProlongRequestEntity,
        {
          job_id: jobId,
        },
        {
          approved: true,
          date_prolong_resolv: new Date(),
        },
      );

      // Во вкладке «Контроль» в поле «Результат контроля» проставляется «Причина»
      // указанная контролером и текст «Срок продлен».
      const contrResult = `${this.CONTROLLER_RESULT_PROLONGTHEJOB} ${comment}`;
      await queryRunner.manager.update(
        JobControlEntity,
        {
          id: maxJobControlId,
        },
        {
          controller_result: contrResult,
        },
      );

      // Во вкладке «Контроль», на основе базовой записи,
      // создается новая запись с новыми данными в поле «Плановая дата»
      // и пустыми полями «Результат предконтроля» и «Результат контроля».
      const baseJobControl = await queryRunner.manager.findOneByOrFail(JobControlEntity, {
        id: maxJobControlId,
      });

      baseJobControl.date_plan = datePlan;
      delete baseJobControl.id;
      delete baseJobControl.prev_controller_result;
      delete baseJobControl.controller_result;

      await queryRunner.manager.save(JobControlEntity, baseJobControl);
      await queryRunner.manager.update(JobEntity, { id: jobId }, { execution_date: datePlan });
      await queryRunner.commitTransaction();

      // уведомление
      await this.notifyOrgJobService.addNotifyJobAny({
        job_id: jobId,
        job_emp: [
          JobEmpEnum.creator,
          JobEmpEnum.author,
          JobEmpEnum.exec_simple,
          JobEmpEnum.exec_respons,
          JobEmpEnum.control_pre,
        ],
        notify_type_id: NotifyTypeEnum.JOB_RESOLV_TERM,
        message: "Поручение № " + addNotifyJobAnyNum + ": срок продлен",
        kind: PsBaseEnum.success,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customError(error.message);
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  /**
   * КОНТРОЛЬ: ОТКАЗАТЬ В ПРОДЛЕНИИ СРОКА
   */
  async refusalToRenew(jobId: number): Promise<boolean> {
    // Проверка на контролёра. Ф-ция доступна контролёру

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const maxJobControlId = await getLastJobControlId(
        this.jobControlRepository,
        jobId,
        queryRunner,
      );

      // проставить отметку в запросе на продление
      await queryRunner.manager.update(
        JobProlongRequestEntity,
        {
          job_id: jobId,
        },
        {
          approved: false,
          date_prolong_resolv: new Date(),
        },
      );

      // Во вкладке «Контроль» в поле «Результат контроля» проставляется текст «Срок не продлен».
      await queryRunner.manager.update(
        JobControlEntity,
        {
          id: maxJobControlId,
        },
        {
          controller_result: this.CONTROLLER_RESULT_REFUSALTORENEW,
        },
      );

      // Во вкладке «Контроль», на основе базовой записи,
      // создается новая запись с пустыми полями «Результат предконтроля» и «Результат контроля».
      const baseJobControl = await queryRunner.manager.findOneByOrFail(JobControlEntity, {
        id: maxJobControlId,
      });

      delete baseJobControl.id;
      delete baseJobControl.prev_controller_result;
      delete baseJobControl.controller_result;

      await queryRunner.manager.save(JobControlEntity, baseJobControl);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customError(error.message);
    } finally {
      await queryRunner.release();
    }

    // уведомление
    await this.notifyOrgJobService.addNotifyJobAny({
      job_id: jobId,
      job_emp: [
        JobEmpEnum.creator,
        JobEmpEnum.author,
        JobEmpEnum.exec_simple,
        JobEmpEnum.exec_respons,
        JobEmpEnum.control_pre,
      ],
      notify_type_id: NotifyTypeEnum.JOB_RESOLV_TERM,
      message: "Поручение № " + addNotifyJobAnyNum + ": в продлении срока ОТКАЗАНО",
      kind: PsBaseEnum.error,
    });

    return true;
  }

  /**
   * КОНТРОЛЬ: ЗАКЛЮЧЕНИЕ ПРЕДКОНТРОЛЕРА
   */
  async setForControlBefore(args: {
    emp_id: number;
    job_id: number;
    note: string;
  }): Promise<JobControlEntity | HttpException> {
    try {
      const { emp_id, job_id, note } = args;

      const jobEntity = await this.jobRepository.findOneBy({
        id: job_id,
        del: false,
        temp: false,
      });

      const jobControlEntityList = await jobEntity.JobControl;
      const jobControlEntity = jobControlEntityList?.at(-1);
      if (!jobControlEntity || emp_id != jobControlEntity?.prev_controller_id) {
        customError("Не найден предконтролер");
      }

      // установить note предконтролера
      this.jobControlRepository.update(jobControlEntity.id, {
        prev_controller_result: note,
      });

      // изменить статус поручения
      this.jobRepository.update(jobEntity.id, {
        status_id: JobStatus.ON_CONTROL,
      });

      return jobControlEntity;
    } catch (err) {
      return httpExceptErr(err);
    }
  }
}
