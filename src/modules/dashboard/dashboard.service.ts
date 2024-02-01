import { Inject,Injectable } from "@nestjs/common";
import { Between,Brackets,DataSource,In,LessThan,Not,Repository } from "typeorm";

import { DocStatus,DocumentTypes } from "../doc/doc.const";
import { DocProject,FORWARDING_STATUS,FORWARDING_VIEW } from "../../common/enum/enum";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { ExecInprojectRouteEntity } from "../../entity/#organization/project/execInprojectRoute.entity";
import { ForwardingEntity } from "../../entity/#organization/forwarding/forwarding.entity";
import { JobEntity } from "../../entity/#organization/job/job.entity";
import { ProjectEntity } from "../../entity/#organization/project/project.entity";
import { getDateBetweenForTermExpires } from "../job/utils/jobs.utils.builder";
import { DashboardStatisticsResponse } from "./dto/dashboard-statistics-response.dto";
import { JobStatus } from "../../BACK_SYNC_FRONT/enum/enum.job";
import { ProjectActionEnum } from "../projects/projects.const";

@Injectable()
export class DashboardService {
  private readonly docRepository: Repository<DocEntity>;
  private readonly jobRepository: Repository<JobEntity>;
  private readonly projectsRepository: Repository<ProjectEntity>;
  private readonly execInprojectRouteEntity: Repository<ExecInprojectRouteEntity>;
  private readonly forwardingEntity: Repository<ForwardingEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.docRepository = dataSource.getRepository(DocEntity);
    this.jobRepository = dataSource.getRepository(JobEntity);
    this.projectsRepository = dataSource.getRepository(ProjectEntity);
    this.execInprojectRouteEntity = dataSource.getRepository(ExecInprojectRouteEntity);
    this.forwardingEntity = dataSource.getRepository(ForwardingEntity);
  }

  /**
   * Посчитать количество новых, на регистрации док-тов
   */
  private async countDoc(cls: number, status: number, userId: number = null): Promise<number> {
    return await this.docRepository.countBy({
      cls_id: cls,
      docstatus: status,
      del: false,
      temp: false,
      author: userId,
    });
  }

  /**
   * Посчитать количество поступивших док-тов
   */
  private async countForwardingDoc(cls: number, userId: number): Promise<number> {
    const { countForwarding } = await this.forwardingEntity
      .createQueryBuilder("forwarding")
      .select("COUNT(DISTINCT Doc.id)::int", "countForwarding")
      .innerJoin("forwarding.Doc", "Doc")
      .where("Doc.del = :del", { del: false })
      .andWhere("Doc.temp = :temp", { temp: false })
      .andWhere("Doc.cls_id = :cls_id", { cls_id: cls })
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            new Brackets((qb) => {
              qb.where("forwarding.veiw_id = :veiw_id", {
                veiw_id: FORWARDING_VIEW.VEIW.id,
              })
                .andWhere("Doc.docstatus IN (:...docstatus)", {
                  docstatus: [DocStatus.REGISTRATE.id, DocStatus.INVIEW.id],
                })
                .andWhere("forwarding.date_end_sender ISNULL");
            }),
          ).orWhere(
            new Brackets((qb) => {
              qb.where("forwarding.veiw_id = :veiw_not_id", {
                veiw_not_id: FORWARDING_VIEW.NOT_VEIW.id,
              }).andWhere("forwarding.status_id = :status_id", {
                status_id: FORWARDING_STATUS.STATUS_NOT_VEIW.id,
              });
            }),
          );
        }),
      )
      .andWhere("forwarding.del = :del", { del: false })
      .andWhere("forwarding.temp = :temp", { temp: false })
      .andWhere("forwarding.emp_receiver = :userId", { userId })
      .getRawOne();

    return countForwarding;
  }

  /**
   * Посчитать количество участников проекта
   */
  private async countProjectsMembers(userId: number, stage: number = null): Promise<number> {
    const query = await this.execInprojectRouteEntity
      .createQueryBuilder("execInProjectRoute")
      .select("COUNT(DISTINCT execInProjectRoute.project_id)::int", "projectsMembers")
      .innerJoin("projects", "Projects", "Projects.id = execInProjectRoute.project_id")
      .where("execInProjectRoute.del = :del", { del: false })
      .andWhere("execInProjectRoute.temp = :temp", { temp: false })
      .andWhere("Projects.temp = :del", { del: false })
      .andWhere("Projects.temp = :temp", { temp: false })
      .andWhere("execInProjectRoute.executor_id = :userId", { userId })
      .andWhere("execInProjectRoute.stage_id = Projects.current_stage_id")
      .andWhere("Projects.status_id NOT IN(:...project_status)", {
        project_status: [DocProject.COMPLETED, DocProject.CLOSED],
      });
    if (stage) {
      query.andWhere("execInProjectRoute.stage_id = :stage", { stage });
    }

    const { projectsMembers } = await query.getRawOne();
    return projectsMembers;
  }

  async statistics(userId: number): Promise<DashboardStatisticsResponse> {
    // Вход. док-ты. Новые
    const newDocIncome = await this.countDoc(DocumentTypes.INCOME, DocStatus.NEWDOC.id);

    // Исходящие. док-ты. На регистрации
    const inregistrateDocIncome = await this.countDoc(
      DocumentTypes.INCOME,
      DocStatus.INREGISTRATE.id,
      userId,
    );

    // Вход. док-ты. Поступившие
    const forwardingDocIncome = await this.countForwardingDoc(DocumentTypes.INCOME, userId);

    // Исходящие. док-ты. Новые
    const newDocOutcome = await this.countDoc(DocumentTypes.OUTCOME, DocStatus.NEWDOC.id);

    // Исходящие. док-ты. На регистрации
    const inregistrateDocOutcome = await this.countDoc(
      DocumentTypes.OUTCOME,
      DocStatus.INREGISTRATE.id,
      userId,
    );

    // Внутренние. док-ты. Новые
    const newDocInner = await this.countDoc(DocumentTypes.INNER, DocStatus.NEWDOC.id);

    // Внутренние. док-ты. На регистрации
    const inregistrateDocInner = await this.countDoc(
      DocumentTypes.INNER,
      DocStatus.INREGISTRATE.id,
      userId,
    );

    // Внутренние. док-ты. Поступившие
    const forwardingDocInner = await this.countForwardingDoc(DocumentTypes.INNER, userId);

    // Поручения. Мои
    const jobsAuthor = await this.jobRepository.countBy({
      status_id: Not(In([JobStatus.FULFILLED, JobStatus.CLOSED])),
      del: false,
      temp: false,
      author_id: userId,
    });

    // Поручения. Исполнитель
    const jobsExecutor = await this.jobRepository.countBy({
      status_id: Not(In([JobStatus.FULFILLED, JobStatus.CLOSED])),
      del: false,
      temp: false,
      Exec_job: { emp_id: userId, del: false },
    });

    // Поручения. Ответственный (создатель)
    const jobsCreated = await this.jobRepository.countBy({
      status_id: Not(In([JobStatus.FULFILLED, JobStatus.CLOSED])),
      del: false,
      temp: false,
      user_created_id: userId,
    });

    // Поручения. Контроль
    const jobsController = await this.jobRepository.countBy({
      status_id: Not(In([JobStatus.FULFILLED, JobStatus.CLOSED])),
      del: false,
      temp: false,
      JobControl: { controller_id: userId },
    });

    // Поручения. Предконтроль
    const jobsPrevController = await this.jobRepository.countBy({
      status_id: Not(In([JobStatus.FULFILLED, JobStatus.CLOSED])),
      del: false,
      temp: false,
      JobControl: { prev_controller_id: userId },
    });

    // Поручения. Ожидающие результатов контроля
    const jobsWaitingController = await this.jobRepository.countBy({
      status_id: JobStatus.ON_CONTROL,
      del: false,
      temp: false,
      JobControl: { controller_id: userId },
    });

    // Поручения. Ожидающие результатов предконтроля
    const jobsWaitingPrevController = await this.jobRepository.countBy({
      status_id: JobStatus.ON_PRECONTROL,
      del: false,
      temp: false,
      JobControl: { prev_controller_id: userId },
    });

    // Роли пользователя поручения, для подсчёта истечения срока и просрочено
    // Исполнитель, контролёр или предконтролёр
    const rolesUser = new Brackets((qb) => {
      qb.where("Exec_job.emp_id = :userId", { userId })
        .orWhere("JobControl.controller_id = :userId", { userId })
        .orWhere("JobControl.prev_controller_id = :userId", { userId });
    });

    // Поручения. Срок истекает
    const { start: startTermExpires, end: endTermExpires } = getDateBetweenForTermExpires();

    const { termExpires } = await this.jobRepository
      .createQueryBuilder("job")
      .select("COUNT(DISTINCT job.id)::int", "termExpires")
      .leftJoin("job.Exec_job", "Exec_job", "Exec_job.del = false")
      .leftJoin("job.JobControl", "JobControl")
      .where({
        status_id: Not(In([JobStatus.FULFILLED, JobStatus.CLOSED])),
        del: false,
        temp: false,
        execution_date: Between(startTermExpires, endTermExpires),
      })
      .andWhere(rolesUser)
      .getRawOne();

    // Поручения. Просрочено
    const { overdue } = await this.jobRepository
      .createQueryBuilder("job")
      .select("COUNT(DISTINCT job.id)::int", "overdue")
      .leftJoin("job.Exec_job", "Exec_job", "Exec_job.del = false")
      .leftJoin("job.JobControl", "JobControl")
      .where({
        status_id: Not(In([JobStatus.FULFILLED, JobStatus.CLOSED])),
        del: false,
        temp: false,
        execution_date: LessThan(new Date()),
      })
      .andWhere(rolesUser)
      .getRawOne();

    // Проекты. Мои
    const projectsAuthor = await this.projectsRepository.countBy({
      del: false,
      temp: false,
      user_created_id: userId,
      status_id: Not(In([DocProject.COMPLETED, DocProject.CLOSED])),
    });

    // Проекты. Участники
    const projectsMembers = await this.countProjectsMembers(userId);
    // Проекты. Участники - Визировать
    const projectsMembersVise = await this.countProjectsMembers(userId, ProjectActionEnum.VIS);
    // Проекты. Участники - Подписать
    const projectsMembersSign = await this.countProjectsMembers(userId, ProjectActionEnum.SIGN);
    // Проекты. Участники - Утвердить
    const projectsMembersApprove = await this.countProjectsMembers(userId, ProjectActionEnum.APPROV);

    return {
      newDocIncome,
      inregistrateDocIncome,
      forwardingDocIncome,
      newDocOutcome,
      inregistrateDocOutcome,
      newDocInner,
      inregistrateDocInner,
      forwardingDocInner,
      jobsAuthor,
      jobsExecutor,
      jobsCreated,
      jobsController,
      jobsPrevController,
      jobsWaitingController,
      jobsWaitingPrevController,
      termExpires,
      overdue,
      projectsAuthor,
      projectsMembers,
      projectsMembersVise,
      projectsMembersSign,
      projectsMembersApprove,
    };
  }
}
