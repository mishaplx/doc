import { HttpException, Inject, Injectable, UseGuards } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DataSource, EntityManager, In, Repository } from "typeorm";

import { PoliceGuard } from "../../auth/guard/police.guard";
import { ActionsJob } from "../../BACK_SYNC_FRONT/actions/actions.job";
import { PsBaseEnum } from "../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { JobStatus } from "../../BACK_SYNC_FRONT/enum/enum.job";
import { DocStatus } from "../doc/doc.const";
import { SortEnum } from "../../common/enum/enum";
import { customError, httpExceptErr } from "../../common/type/errorHelper.type";
import { globalSearchJobBuilder } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { getDataSourceAdmin } from "../../database/datasource/tenancy/tenancy.utils";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { HistoryResponsibleEntity } from "../../entity/#organization/history_responsible/history_responsible.entity";
import { JobEntity } from "../../entity/#organization/job/job.entity";
import { JobApproveEntity } from "../../entity/#organization/job/jobApprove.entity";
import { ExecJobEntity } from "../../entity/#organization/job/jobExec.entity";
import { JobProlongRequestEntity } from "../../entity/#organization/job/jobProlongRequest.entity";
import { JobStatusesEntity } from "../../entity/#organization/job/jobStatus.entity";
import { ReportExecutorEntity } from "../../entity/#organization/report_executior/report_executor.entity";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";
import { UnitEntity } from "../../entity/#organization/unit/unit.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { getAccessEnablingJob } from "../access/accessEnabling/accessEnabling.job";
import { AccessJob } from "../access/accessValid/job/accessValid.job";
import { FavoritesService } from "../favorites/favorites.service";
import { NotifyTypeEnum } from "../notify/notify.const";
import { NotifyOrgService } from "../notify/org/notifyOrg.service";
import { JobEmpEnum, NotifyOrgJobService } from "../notify/org/notifyOrgJob.service";
import { GetJobsArgs } from "./dto/get-jobs.args";
import { OrderJobsInput } from "./dto/order-jobs-request.dto";
import { PaginatedJobResponse } from "./dto/paginated-jobs-response.dto";
import { JobUpdateInput } from "./dto/update-jobs.input";
import { docNameforJob } from "./utils/job.utils";
import { getDateBetweenForTermExpires, setQueryBuilderJob } from "./utils/jobs.utils.builder";
import { jobFinalize } from "./utils/jobs.utils.finalize";

@UseGuards(PoliceGuard)
@Injectable()
export class JobsService {
  public readonly jobsRepository: Repository<JobEntity>;
  public readonly staffRepository: Repository<StaffEntity>;
  public readonly execJobRepository: Repository<ExecJobEntity>;
  public readonly jobsApproveRepository: Repository<JobApproveEntity>;
  public readonly EmpRepository: Repository<EmpEntity>;
  public readonly fileBlockRepository: Repository<FileBlockEntity>;
  public readonly docRepository: Repository<DocEntity>;
  public readonly jobStatusRepository: Repository<JobStatusesEntity>;
  public readonly reportExecutorRepository: Repository<ReportExecutorEntity>;
  public readonly HistoryResponsibleRepository: Repository<HistoryResponsibleEntity>;
  public readonly jobProlongRequestRepository: Repository<JobProlongRequestEntity>;
  public readonly UnitRepository: Repository<UnitEntity>;

  public readonly accessJob: AccessJob;

  constructor(
    @Inject(DATA_SOURCE) public readonly dataSource: DataSource,
    @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
    @Inject(NotifyOrgJobService) private readonly notifyOrgJobService: NotifyOrgJobService,
    @Inject(FavoritesService) private FavoritesService: FavoritesService,
  ) {
    this.jobsRepository = dataSource.getRepository(JobEntity);
    this.staffRepository = dataSource.getRepository(StaffEntity);
    this.fileBlockRepository = dataSource.getRepository(FileBlockEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
    this.EmpRepository = dataSource.getRepository(EmpEntity);
    this.UnitRepository = dataSource.getRepository(UnitEntity);
    this.HistoryResponsibleRepository = dataSource.getRepository(HistoryResponsibleEntity);
    this.execJobRepository = dataSource.getRepository(ExecJobEntity);
    this.jobStatusRepository = dataSource.getRepository(JobStatusesEntity);
    this.jobProlongRequestRepository = dataSource.getRepository(JobProlongRequestEntity);
    this.reportExecutorRepository = dataSource.getRepository(ReportExecutorEntity);
    this.jobsApproveRepository = dataSource.getRepository(JobApproveEntity);

    this.accessJob = new AccessJob(dataSource);
  }
  async getAllTypeReport(): Promise<ReportExecutorEntity[]> {
    return await this.reportExecutorRepository.find();
  }

  /**
   * ПОРУЧЕНИЕ: СОЗДАТЬ
   */
  async createJob(emp_id: number, docId: number | null): Promise<{ id: number }> {
    if (docId) {
      const doc = await this.docRepository.findOne({ where: { id: docId } });
      const nameDocInJob = docNameforJob(doc);
      const res = this.jobsRepository.create({
        del: false,
        temp: true,
        doc_id: docId,
        author_id: emp_id,
        status_id: 1,
        dtc: new Date(),
        user_created_id: emp_id,
        name_doc_in_job: nameDocInJob,
      });
      const { id } = await this.jobsRepository.save(res);
      return { id };
    }
    const res = this.jobsRepository.create({
      del: false,
      temp: true,
      doc_id: docId,
      author_id: emp_id,
      status_id: JobStatus.IN_PROGRESS,
      dtc: new Date(),
      user_created_id: emp_id,
    });

    const { id } = await this.jobsRepository.save(res);

    // заполнить номер поручения по умолчанию
    // TODO: в перспективе нумератор
    // выключили заполнение num для темповой записи!
    await this.jobsRepository.update({ id: id }, { num: null });

    return { id };
  }

  /**
   * ПОРУЧЕНИЕ: СОЗДАТЬ ДОЧЕРНЕЕ
   */
  async createChildrenJob(args: {
    manager?: EntityManager;
    emp_id: number;
    job_id: number;
  }): Promise<JobEntity | HttpException> {
    const { manager, emp_id, job_id } = args;
    try {
      const managerLocal = manager ? manager : this.dataSource.manager;
      const jobEntity = await managerLocal.findOneBy(JobEntity, {
        id: job_id,
        del: false,
      });

      // const { doc_id } = parentJob;
      const res = managerLocal.create(JobEntity, {
        del: false,
        temp: true,
        doc_id: jobEntity.doc_id,
        author_id: emp_id,
        parent_job_id: job_id,
        main_job_id: jobEntity.main_job_id || jobEntity.id,
        status_id: JobStatus.IN_PROGRESS,
        user_created_id: emp_id,
      });

      return await managerLocal.save(JobEntity, res);
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  async getSubJobCount(parentId: number): Promise<string> {
    const { count } = (
      (await this.dataSource.query(`SELECT COUNT(*)
      FROM sad.jobs_rls_off
      WHERE temp = false
      AND parent_job_id = ${parentId};`)) ?? []
    ).at(() => 0);
    const result = (Number(count) ?? 0) + 1;
    return result.toString();
  }

  async getJobCount(): Promise<string> {
    const { count } = (
      (await this.dataSource.query(`SELECT COUNT(*)
      FROM sad.jobs_rls_off
      WHERE temp = false
      AND parent_job_id IS NULL;`)) ?? []
    ).at(() => 0);
    const result = (Number(count) ?? 0) + 1;
    return result.toString();
  }

  /**
   * ПОРУЧЕНИЕ: ОБНОВИТЬ
   **/
  async updateJob(args: {
    emp_id: number;
    jobId: number;
    jobItem: JobUpdateInput;
  }): Promise<JobEntity | HttpException> {
    try {
      const { jobId, jobItem } = args;
      const jobEntity = await this.jobsRepository.findOneByOrFail({ id: jobId });

      // номер поручения: при отстутствии создать
      if (!jobItem.num && !jobEntity.num && !jobEntity.parent_job_id) {
        jobItem.num = await this.getJobCount();
      } else if (!jobItem.num && !jobEntity.num && jobEntity.parent_job_id) {
        const count = await this.getSubJobCount(jobEntity.parent_job_id);
        const parentJobEntity = await this.jobsRepository.findOneByOrFail({
          id: jobEntity.parent_job_id,
        });
        jobItem.num = `${parentJobEntity.num}/${count}`;
      }

      jobItem.temp = false;
      await this.jobsRepository.update(
        {
          id: jobId,
          // status_id: In([
          //   JobStatus.IN_PROGRESS,
          //   JobStatus.ON_APPROVAL,
          //   JobStatus.ON_REWORK,
          // ]),
        },
        jobItem,
      );

      return this.jobsRepository.findOneBy({ id: jobId });
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  /**
   * ПОРУЧЕНИЯ: ПРОЧИТАТЬ ВСЕ
   */
  async getAllJobs(
    args: GetJobsArgs,
    pagination: PaginationInput,
    orderBy: OrderJobsInput,
    empId: number,
    searchField: string,
  ): Promise<PaginatedJobResponse> {
    const queryBuilder = this.jobsRepository.createQueryBuilder("job");
    const { pageNumber, pageSize, All } = pagination;

    setQueryBuilderJob(args, empId, orderBy, queryBuilder);
    if (searchField?.trim()) {
      globalSearchJobBuilder(queryBuilder, searchField);
    }

    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [jobs, total] = await queryBuilder.getManyAndCount();

    // await this.filterChildrenJobs(jobs);
    // await this.dataSource.query(`set session "rls.emp_id" = '${empId}';`);

    // // удалить недоступные записи
    // for (let ind = jobs.length - 1; ind >= 0; ind--) {
    //   const recExists = !!await this.jobsRepository.findOneBy({ id: jobs[ind].parent_job_id });

    //   if (args.mainJob) {
    //     // parent_job_id отсутствует
    //     if (!jobs[ind].parent_job_id) continue;
    //     // parent_job_id не доступен по RLS
    //     if (!recExists) continue;
    //   } else {
    //     // parent_job_id задан и доступен по RLS
    //     if (
    //       jobs[ind].parent_job_id &&
    //       recExists
    //     )
    //       continue;
    //   }

    //   jobs.splice(ind, 1);
    // }
    // const total = jobs.length;

    this.setOverdueAndTermExpires(jobs);
    return paginatedResponseResult(jobs, pageNumber, pageSize, total);
  }

  // ВЫЗЫВАЕТ СБОЙ TYPE ORM
  // async filterChildrenJobs(jobs): Promise<void> {
  //   for await (const job of jobs) {
  //     const childrenJobs: JobEntity[] = await job.childrenJobs;
  //     job.childrenJobs = childrenJobs.filter((chJob) => !chJob.del && !chJob.temp);
  //     const newChildrenJobs: JobEntity[] = await job.childrenJobs;
  //     newChildrenJobs.sort(function (a, b) {
  //       return b.id - a.id;
  //     });
  //     if (newChildrenJobs[0]) {
  //       await this.filterChildrenJobs(newChildrenJobs);
  //     }
  //   }
  // }

  /**
   * Генерация полей: "Просроченные поручения" и "Срок истекает"
   */
  setOverdueAndTermExpires(jobs: JobEntity[]): void {
    jobs.forEach((job) => {
      job.overdue = !!(job.execution_date && job.execution_date < new Date());
      const { start, end } = getDateBetweenForTermExpires();
      job.termExpires = !!(
        job.execution_date &&
        job.execution_date >= start &&
        job.execution_date <= end
      );
    });
  }

  /**
   * ПОРУЧЕНИЕ: ПРОЧИТАТЬ
   */
  async getJobsById(token: IToken, job_id: number): Promise<JobEntity | HttpException> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const jobEntity = await manager.findOneBy(JobEntity, {
          id: job_id,
          del: false,
        });
        if (!jobEntity) customError("Поручение не найдено");
        const execJobEntityList = await jobEntity.Exec_job;

        // количество файлов
        jobEntity.countFile = await manager.countBy(FileBlockEntity, {
          job_id: job_id,
        });

        // количество исполнителей, проставивших отметку "исполнено"
        let countExecIsFinal = 0;
        for (const item_exec_job of execJobEntityList) {
          if (item_exec_job.del) continue;
          for (const item_reports of await item_exec_job.Reports) {
            if (item_reports.is_final) {
              countExecIsFinal++;
              break;
            }
          }
        }
        jobEntity.countExecIsFinally = countExecIsFinal;

        // ДОСТУПНЫЕ ОПЕРАЦИИ
        jobEntity.EnablingActions = await getAccessEnablingJob({
          emp_id: token.current_emp_id,
          manager: manager,
          jobEntity: jobEntity,
        });

        // проставить отметку об ознакомлении исполнителя с поручением
        for (const item_exec_job of execJobEntityList) {
          if (
            item_exec_job.date_reading == null &&
            item_exec_job.emp_id == token.current_emp_id &&
            !item_exec_job.del
          ) {
            await manager.update(
              ExecJobEntity,
              { id: item_exec_job.id },
              { date_reading: new Date() },
            );
            break;
          }
        }
        jobEntity.isFavorites = await this.FavoritesService.isFavorite(token, null, job_id);
        return jobEntity;
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  /**
   * ПОРУЧЕНИЕ: УДАЛИТЬ
   */
  async deleteJobs(args: { emp_id: number; job_id: number }): Promise<JobEntity | HttpException> {
    try {
      const { emp_id, job_id } = args;

      // найти поручение
      const jobEntity = await this.dataSource.manager.findOneOrFail(JobEntity, {
        where: {
          id: job_id,
          del: false,
        },
        relations: {
          Exec_job: true,
        },
      });

      // все исполнители поручения
      // const execEntity = (await jobEntity.Exec_job)?.filter((item) => !item.del); //TODO value never used

      const ret = await this.dataSource.transaction(async (manager) => {
        // доступность операции
        await this.accessJob.valid({
          emp_id: emp_id,
          actions: [ActionsJob.JOB_DELETE],
          args_parsed: {
            job: [jobEntity],
          },
        });

        // на всякий случай: имеются ли нижестоящие поручения
        const countChildren = await manager.count(JobEntity, {
          where: {
            parent_job_id: job_id,
            del: false,
          },
        });
        if (countChildren) {
          customError("Имеются нижестоящие поручения");
        }

        // пометить поручение как удаленное
        jobEntity.del = true;
        await manager.save(JobEntity, jobEntity);

        return jobEntity;
      });

      // уведомление заинтересованным
      // TODO: использовать addNotifyJobAny
      await this.notifyOrgService.addNotify({
        notify_type_id: NotifyTypeEnum.JOB_RESOLV_DELETE,
        emp_ids: await this.notifyOrgJobService.getRelEmp({ job_id: job_id }),
        job_id: job_id,
        message: "Поручение № " + jobEntity.num + ": удалено",
      });

      return ret;
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  /**
   * ПОРУЧЕНИЕ: ИСПОЛНИТЬ (создать отчет исполнителя по поручению)
   */
  async createReport(args: {
    emp_id: number;
    job_id: number;
    typeReport: boolean;
    note: string;
  }): Promise<ReportExecutorEntity | HttpException> {
    try {
      const { emp_id, job_id, typeReport, note } = args;

      // исполнитель, создающий отчет по поручению
      const execEntity = await this.dataSource.manager.findOneBy(ExecJobEntity, {
        emp_id: emp_id,
        job_id: job_id,
        del: false,
        date_end: null,
      });
      if (!execEntity) customError("Отчет может создать только исполнитель поручения");

      // поручение
      const jobEntity = await execEntity.Job;
      if (!jobEntity) customError("Поручение не найдено");

      // блокировку повторного ввода окончательного отчета не делаем

      // источник данных с ПРАВАМИ АДМИНА: необходимость выполнения операций в отношении невидимых поручений
      const dataSourceAdmin = await getDataSourceAdmin(this.dataSource.options.database as string);

      const ret = await dataSourceAdmin.transaction(async (manager) => {
        // создать отчет исполнителя
        const result = await manager.save(ReportExecutorEntity, {
          exec_job_id: execEntity.id,
          note: note,
          is_final: typeReport,
          dtc: new Date(),
        });

        // если ответственный исполнитель и окончательный отчет
        if (execEntity.is_responsible && typeReport) {
          // // незакрытый контроль (единственный, но на всякий случай последний)
          // const jobControlEntity = (await jobEntity.JobControl)
          //   ?.filter((item) => !item.date_fact)
          //   ?.at(-1);
          // незакрытый контроль
          let jobControlEntity = await jobEntity.JobControlLast;
          if (jobControlEntity?.date_fact) jobControlEntity = undefined;

          // КОНТРОЛЬ: ЕСТЬ
          if (jobControlEntity) {
            // предконтроль
            const empPrevControlEntity = await jobControlEntity?.PrevController;

            // изменить статус поручения "НА ПРЕДКОНТРОЛЕ" / "НА КОНТРОЛЕ"
            await manager.update(JobEntity, jobEntity.id, {
              status_id: empPrevControlEntity ? JobStatus.ON_PRECONTROL : JobStatus.ON_CONTROL,
            });

            // КОНТРОЛЬ: НЕТ
          } else {
            // Завершить поручение
            await jobFinalize({
              manager: manager,
              job_id: job_id,
            });
          }
        }

        return result;
      });

      // уведомление если ответственный исполнитель и окончательный отчет
      // TODO: использовать addNotifyJobAny
      if (execEntity.is_responsible && typeReport) {
        await this.notifyOrgJobService.addNotifyJobAny({
          job_id: job_id,
          job_emp: [JobEmpEnum.all],
          notify_type_id: NotifyTypeEnum.JOB_INFO_FULFILLED,
          message: "Поручение № " + jobEntity.num + ": исполнено",
          kind: PsBaseEnum.info,
        });
      }

      return ret;
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  async getAllAuthor(): Promise<EmpEntity[]> {
    return this.EmpRepository.find();
  }

  async getAllActualAuthor(): Promise<EmpEntity[]> {
    return this.EmpRepository.find({ where: { del: false } });
  }

  // async getReportInExecutor(): Promise<ReportExecutorEntity[]> {
  //   return await this.reportExecutorRepository.find();
  // }

  /** ПОРУЧЕНИЕ: ОТВЕТСТВЕННЫЙ ИСПОЛНИТЕЛЬ */
  // async installStartIsResponsible(isResponsible, job: JobEntity): Promise<void> {
  //   const emp = await this.EmpRepository.findOne({
  //     where: {
  //       id: isResponsible.emp_id,
  //     },
  //   });
  //
  //   await this.HistoryResponsibleRepository.save({
  //     date_start: new Date(),
  //     emp_id: emp.id,
  //     job_id: job.id,
  //   });
  // }

  /**
   * получение всех поручений по Исполнителю
   */
  async getAllJobByUser(id: number): Promise<ExecJobEntity[]> {
    return await this.execJobRepository.find({
      relations: {
        Job: {
          Author: true,
        },
      },
      where: {
        emp_id: id,
      },
    });
  }

  async getAllReportsByJob(id: number): Promise<ReportExecutorEntity[]> {
    const arrExec = await this.execJobRepository.find({
      where: { job_id: id },
    });
    const arrIdExec = arrExec.map((el) => el.id);
    return await this.reportExecutorRepository.find({
      where: { exec_job_id: In(arrIdExec) },
    });
  }

  /**
   * ИСТОРИЯ ОТЧЕТОВ ИСПОЛНИТЕЛЕЙ
   */
  async getReportsByJob(args: { job_id: number }): Promise<ReportExecutorEntity[] | HttpException> {
    try {
      const { job_id } = args;

      return await this.reportExecutorRepository.find({
        where: {
          Exec_job: {
            job_id: job_id,
            del: false,
          },
        },
        relations: { Exec_job: true },
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  /**
   * отчеты исполнителя по поручению
   */
  async getAllReportsByExec(idExec: number): Promise<ReportExecutorEntity[]> {
    return await this.reportExecutorRepository.find({
      where: {
        exec_job_id: idExec,
      },
    });
  }

  /**
   * КОНТРОЛЬ: ЗАПРОС ПРОДЛЕНИЯ СРОКА
   */
  async askForProlong(args: {
    emp_id: number;
    job_id: number;
    date_end: Date;
    note: string;
  }): Promise<JobProlongRequestEntity | HttpException> {
    try {
      const { emp_id, job_id, date_end, note } = args;

      // запросивший продление исполнитель
      const execJobEntity = await this.execJobRepository.findOneBy({
        emp_id: emp_id,
        job_id: job_id,
        del: false,
        date_end: null,
      });
      if (!execJobEntity) customError("Не найден исполнитель поручения");

      // номер поручения
      const jobEnityNum = await this.dataSource.manager.findOneOrFail(JobEntity, {
        select: { num: true },
        where: { id: args.job_id },
      });

      // создать запрос на продление
      const jobProlongRequestEntity = await this.jobProlongRequestRepository.save({
        job_id: job_id,
        exec_job_id: execJobEntity.id,
        prolong_note: note,
        date_prolong_end: date_end,
      });

      // уведомление контролеру
      const emp_control = await this.notifyOrgJobService.getRelEmp({
        job_id: job_id,
        job_emp: [JobEmpEnum.control_main],
      });
      // TODO: использовать addNotifyJobAny
      await this.notifyOrgService.addNotify({
        notify_type_id: NotifyTypeEnum.JOB_REQUEST_TERM,
        emp_ids: emp_control,
        job_id: job_id,
        message: "Поручение № " + jobEnityNum.num + ": запрос продления срока",
        kind: PsBaseEnum.warning,
      });

      // уведомление создателю, автору, исполнителям, предконтролеру
      let emp_any = await this.notifyOrgJobService.getRelEmp({
        job_id: job_id,
        job_emp: [
          JobEmpEnum.creator,
          JobEmpEnum.author,
          JobEmpEnum.exec_simple,
          JobEmpEnum.exec_respons,
          JobEmpEnum.control_pre,
        ],
      });
      // контроллеру больше ничего не направлять
      emp_any = emp_any.filter((item) => item != emp_control.at(0));
      // TODO: использовать addNotifyJobAny
      await this.notifyOrgService.addNotify({
        notify_type_id: NotifyTypeEnum.JOB_REQUEST_TERM,
        emp_ids: emp_any,
        job_id: job_id,
        message: "Поручение № " + jobEnityNum.num + ": направлен запрос о продлении срока",
        kind: PsBaseEnum.warning,
      });

      return jobProlongRequestEntity;
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  /**
   * ПОРУЧЕНИЕ: ОТПРАВИТЬ НА ИСПОЛНЕНИЕ
   */
  async sendToExecution(args: {
    emp_id: number;
    job_id: number;
  }): Promise<JobEntity | HttpException> {
    try {
      const { job_id } = args;

      // нулевые emp-статусы по поручению
      const notify = await this.notifyOrgJobService.memoNotifyJobStatusNull({
        job_id: job_id,
        manager: this.dataSource.manager,
      });

      // поручение
      const jobEntity = await this.jobsRepository.findOne({
        // where: { id: job_id, Exec_job: { del: false} }, // так не точная причина отказа
        where: { id: job_id, del: false },
        relations: { Status: true, Exec_job: true },
      });

      // исполнители
      const execEntity = (await jobEntity.Exec_job).filter((item) => !item.del);
      if (!execEntity || execEntity.length == 0) customError("Не найдены исполнители поручения");

      // установить статус поручения: на исполнении
      // проставить дату направления на исполнение
      await this.jobsRepository.update(
        { id: job_id },
        {
          status_id: JobStatus.ON_EXECUTION,
          execution_start: new Date(),
        },
      );

      // при наличии документа - изменить его статус
      const doc = await jobEntity.Doc;
      if (doc) {
        await this.docRepository.update(
          { id: doc.id },
          {
            docstatus: DocStatus.INDO.id,
          },
        );
      }

      // уведомления об изменении статусов
      await this.notifyOrgJobService.addNotifyJobStatus({
        memo: notify,
        job_emp: [JobEmpEnum.exec_all, JobEmpEnum.control_all],
      });

      return jobEntity;
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  // async getProlongHistory(id: number): Promise<JobProlongRequestType[]> {
  //   const obj: any = {};
  //  // const name = await this.execJobRepository.findOneBy({ id: id });
  //
  //   // FIXME
  //   // obj.data = await this.jobProlongRequestRepository.find({
  //   //   where: {
  //   //     prolong_request: {
  //   //       id: id,
  //   //     },
  //   //   },
  //   // });
  //   // obj.ObjExecJob = name;
  //   // console.log(obj);
  //   return obj;
  // }

  /**
   * ПОИСК EMP
   */
  async SearchEmp(searchValues: string): Promise<EmpEntity[]> {
    const search = searchValues.trim().toLowerCase();
    const empAll = await this.EmpRepository.createQueryBuilder("emp")
      .select()
      .addSelect("LOWER(Staff_al.ln)", "ln_lower")
      .addSelect("LOWER(Staff_al.nm)", "nm_lower")
      .addSelect("LOWER(Staff_al.mn)", "mn_lower")
      .leftJoinAndSelect("emp.User", "User_al")
      .leftJoinAndSelect("User_al.Staff", "Staff_al")
      .where(" emp.del=false and emp.temp = false and ( emp.de is null OR emp.de >= current_date)")
      .orderBy("ln_lower", SortEnum.ASC)
      .addOrderBy("nm_lower", SortEnum.ASC)
      .addOrderBy("mn_lower", SortEnum.ASC)
      .addOrderBy("emp.post_id", SortEnum.ASC)
      .getMany();
    if (search.length == 0) return empAll;
    // фильтр по ФИО
    const empFilter = [];
    for (const empItem of empAll) {
      const user = await empItem.User;
      const post = await empItem.post;
      const user_id = user?.id;
      if (user_id) {
        const { nm, ln, mn, personnal_number } = await this.staffRepository.findOne({
          select: {
            ln: true,
            nm: true,
            mn: true,
            personnal_number: true,
          },
          where: {
            user_id: user_id,
          },
        });
        const userName = nm;
        const userLastName = ln;
        const userMiddlename = mn ?? "";

        const fio = userLastName + " " + userName + " " + userMiddlename;
        const fioWithoutSpace = userLastName + userName + userMiddlename;
        const personnalNumber = personnal_number ? personnal_number : "";

        if (
          fio.toLowerCase().includes(search) ||
          fioWithoutSpace.toLowerCase().includes(search) ||
          personnalNumber.toLowerCase().includes(search) ||
          post.nm.toLowerCase().includes(search)
        ) {
          empFilter.push(empItem);
        }
      }
    }
    return empFilter;
  }
}
