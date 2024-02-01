import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { ActionsJob } from "../../BACK_SYNC_FRONT/actions/actions.job";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { JobEntity } from "../../entity/#organization/job/job.entity";
import { ExecJobEntity } from "../../entity/#organization/job/jobExec.entity";
import { JobProlongRequestEntity } from "../../entity/#organization/job/jobProlongRequest.entity";
import { ReportExecutorEntity } from "../../entity/#organization/report_executior/report_executor.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { Access } from "../access/guard/access.guard";
import { GetJobsArgs } from "./dto/get-jobs.args";
import { OrderJobsInput } from "./dto/order-jobs-request.dto";
import { PaginatedJobResponse } from "./dto/paginated-jobs-response.dto";
import { JobUpdateInput } from "./dto/update-jobs.input";
import { JobsService } from "./job.service";

@Resolver()
export class JobsResolver {
  constructor(private jobsService: JobsService) {}

  /**
   * ПОРУЧЕНИЯ: ПРОЧИТАТЬ ВСЕ
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => PaginatedJobResponse, {
    description: "Получение всех поручений",
  })
  getAllJobs(
    @Token() token: IToken,
    @Args() args: GetJobsArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка",
    })
    order?: OrderJobsInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedJobResponse> {
    return this.jobsService.getAllJobs(args, pagination, order, token.current_emp_id, searchField);
  }

  /**
   * ПОРУЧЕНИЕ: ПРОЧИТАТЬ
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => JobEntity, {
    description: "Получения определённого поручения",
    nullable: true,
  })
  async getJobsById(
    @Token() token: IToken,
    @Args("id", { type: () => Int }) id: number,
  ): Promise<JobEntity | HttpException> {
    return await this.jobsService.getJobsById(token, id);
  }

  /**
   * ПОРУЧЕНИЕ: УДАЛИТЬ
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  // @Access(ActionsJob.JOB_DELETE) FIXME: id -> job_id
  @Mutation(() => JobEntity, { description: "удаление поручения" })
  async deleteJobs(
    @Token() token: IToken,
    @Args("id") id: number,
  ): Promise<JobEntity | HttpException> {
    return this.jobsService.deleteJobs({
      emp_id: token.current_emp_id,
      job_id: id,
    });
  }

  /**
   * ПОРУЧЕНИЕ: СОЗДАТЬ
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => JobEntity, { description: "создание поручения" })
  async createJob(
    @Token() token: IToken,
    @Args("docId", { nullable: true, type: () => Int }) docId: number | null,
  ) {
    return this.jobsService.createJob(token.current_emp_id, docId);
  }

  /**
   * ПОРУЧЕНИЕ: СОЗДАТЬ ДОЧЕРНЕЕ
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => JobEntity, { description: "создание нижестоящее  поручение" })
  @Access(ActionsJob.JOB_CREATE_CHILD)
  async createChildrenJob(
    @Token() token: IToken,
    @Args("job_id", { type: () => Int, nullable: false, description: "id родительского поручения" })
    job_id: number,
  ): Promise<JobEntity | HttpException> {
    return this.jobsService.createChildrenJob({
      emp_id: token.current_emp_id,
      job_id: job_id,
    });
  }

  /**
   * ПОРУЧЕНИЕ: ОБНОВИТЬ
   **/
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => JobEntity, { description: "Редактирование поручения" })
  @Access(ActionsJob.JOB_UPDATE)
  async updateJob(
    @Token() token: IToken,
    @Args("jobId", { type: () => Int }) jobId: number,
    @Args("jobItem") jobItem: JobUpdateInput,
  ): Promise<HttpException | JobEntity> {
    return this.jobsService.updateJob({
      emp_id: token.current_emp_id,
      jobId: jobId,
      jobItem: jobItem,
    });
  }

  /**
   * ПОРУЧЕНИЕ: ИСПОЛНИТЬ (создать отчет исполнителя по поручению)
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => JobEntity, {
    description: "Создать отчет исполнителя по поручению",
  })
  @Access(ActionsJob.JOB_SET_EXEC)
  async createReport(
    @Token() token: IToken,
    @Args("job_id", { type: () => Int, description: "id исполнителя" })
    Id: number,
    @Args("typeReport", { description: "тип отчета" }) typeReport: boolean,
    @Args("note", { description: "текст отчета" }) note: string,
  ): Promise<ReportExecutorEntity | HttpException> {
    return this.jobsService.createReport({
      emp_id: token.current_emp_id,
      job_id: Id,
      typeReport: typeReport,
      note: note.trim(),
    });
  }
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => [ReportExecutorEntity], {
    description: "Получения типа отчёта",
  })
  async getTypeReport(): Promise<ReportExecutorEntity[]> {
    return await this.jobsService.getAllTypeReport();
  }

  // @UseGuards(DeactivateGuard, PoliceGuard)
  // @Query(() => JobProlongRequestType, {
  //   description: "просмотра списка продления контроля по выбранному поручению",
  // })
  // async getProlongHistory(
  //   @Args("Id", { description: "id Исполнителя он же Exec_job->id" })
  //   Id: number,
  // ): Promise<JobProlongRequestType[]> {
  //   return await this.jobsService.getProlongHistory(Id);
  // }

  @Query(() => [EmpEntity], {
    description: "Получения Авторов, Исполнителей, Контролёров поручения",
  })
  async getAllAuthor(): Promise<EmpEntity[]> {
    return this.jobsService.getAllAuthor();
  }

  @Query(() => [EmpEntity], {
    description: "Получения Актуальных Авторов, Исполнителей, Контролёров поручения",
  })
  async getAllActualAuthor(): Promise<EmpEntity[]> {
    return this.jobsService.getAllActualAuthor();
  }
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => [ReportExecutorEntity], {
    description: "1.3.4.2\n" + "Вкладка «Исполнители»\n" + "Просмотреть (Просмотреть отчеты)",
  })
  // async getReportInExecutor(
  //   @Args("Id", { description: "id исполнителя" }) Id: number,
  // ): Promise<ReportExecutorEntity[]> {
  //   return this.jobsService.getReportInExecutor(Id);
  // }
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => [ExecJobEntity], {
    description: "получение всех поручений по Исполнителю",
  })
  async getAllJobByUser(
    @Args("idExec", {
      description: "id Исполнителя",
    })
    idExec: number,
  ): Promise<ExecJobEntity[]> {
    return this.jobsService.getAllJobByUser(idExec);
  }
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => [ReportExecutorEntity], {
    description: "получение всех отчётов по Поручению",
  })
  async getAllReportsByJob(
    @Args("id", {
      description: "id Поручения",
    })
    id: number,
  ): Promise<ReportExecutorEntity[]> {
    return this.jobsService.getAllReportsByJob(id);
  }

  /**
   * ИСТОРИЯ ОТЧЕТОВ ИСПОЛНИТЕЛЕЙ
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => [ReportExecutorEntity], {
    description: "получение всех отчётов по Поручению",
  })
  @Access(ActionsJob.JOB_HISTORY_REPORT)
  async getReportsByJob(
    @Args("job_id", {
      type: () => Int,
      description: "id поручения",
    })
    job_id: number,
  ): Promise<ReportExecutorEntity[] | HttpException> {
    return this.jobsService.getReportsByJob({
      job_id: job_id,
    });
  }

  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => [ReportExecutorEntity], {
    description: "получение всех отчётов Исполнителя по Поручению",
  })
  async getAllReportsByExec(
    // @Args('idJob', {
    //   description: 'id Поручения',
    // })
    // idJob: number,
    @Args("idExec", {
      description: "id Исполнителя - idExec",
    })
    idExec: number,
  ): Promise<ReportExecutorEntity[]> {
    return this.jobsService.getAllReportsByExec(idExec);
  }

  /**
   * КОНТРОЛЬ: ЗАПРОС СРОКА ПРОДЛЕНИЯ СРОКА
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => JobProlongRequestEntity, {
    description: "Запрос на продление срока",
  })
  @Access(ActionsJob.JOB_ASK_PROLONG)
  async askForProlong(
    @Token() token: IToken,

    @Args("job_id", { type: () => Int, description: "id поручения" })
    job_id: number,

    @Args("date_end", { description: "Запрашиваемая дата продления" })
    date_end: Date,

    @Args("note", { description: "Причина", nullable: false })
    note: string,
  ): Promise<JobProlongRequestEntity | HttpException> {
    return this.jobsService.askForProlong({
      emp_id: token.current_emp_id,
      job_id: job_id,
      date_end: date_end,
      note: note,
    });
  }

  /**
   * ПОРУЧЕНИЕ: ОТПРАВИТЬ НА ИСПОЛНЕНИЕ
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => JobEntity, {
    description: "Отправка поручения на исполнение",
  })
  @Access(ActionsJob.JOB_SEND_EXEC)
  async sendToExecution(
    @Token() token: IToken,

    @Args("jobId", {
      type: () => Int,
      description: "id поручения",
    })
    jobId: number,
  ): Promise<JobEntity | HttpException> {
    return this.jobsService.sendToExecution({
      emp_id: token.current_emp_id,
      job_id: jobId,
    });
  }

  @Query(() => [EmpEntity], {
    description:
      "Поиск исполнителей по разным параметрам (по должности, фамилии, имени, отчеству, подразделению)",
  })
  async SearchEmp(
    @Args("searchValues", {
      description: "строка поиска",
      type: () => String,
    })
    searchValues: string,
  ): Promise<EmpEntity[]> {
    return this.jobsService.SearchEmp(searchValues);
  }
}
