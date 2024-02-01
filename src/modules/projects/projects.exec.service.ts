import { Inject } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { PsBaseEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";
import {
  DocProject,
  OrderProjectsEnum,
  PartiesProjects,
  PREF_ERR,
  SortEnum,
} from "src/common/enum/enum";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "src/entity/#organization/file/fileVersion.entity";
import { PostEntity } from "src/entity/#organization/post/post.entity";
import { SignEntity } from "src/entity/#organization/sign/sign.entity";
import { StaffEntity } from "src/entity/#organization/staff/staff.entity";
import { UserEntity } from "src/entity/#organization/user/user.entity";
import { NotifyTypeEnum } from "src/modules/notify/notify.const";
import {
  NotifyOrgProjectService,
  ProjectEmpEnum,
} from "src/modules/notify/org/notifyOrgProject.service";
import {
  Brackets,
  DataSource,
  EntityManager,
  IsNull,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from "typeorm";

import { customError } from "../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { ExecInprojectRouteEntity } from "../../entity/#organization/project/execInprojectRoute.entity";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { ProjectEntity } from "../../entity/#organization/project/project.entity";
import { ProjectActionEntity } from "../../entity/#organization/project/ProjectAction.entity";
import { ProjectCurrentRouteEntity } from "../../entity/#organization/project/ProjectcurrentRoute.entity";
import { Doc_route_actionType } from "./dto/currentroute/doc_route_action";
import { GetProjectsArgs } from "./dto/get-projects.args";
import { OrderProjectsInput } from "./dto/order-projects-request.dto";
import { TabsProject } from "./type/project.enum";
import { checkQueue } from "./utils/project.utils";
import { ProjectActionEnum, projectMessageErr, ProjectStatus } from "./projects.const";

interface CheckSendRoute {
  flag: boolean;
  message: string;
}
export class ProjectExecService {
  private readonly docRepository: Repository<DocEntity>;
  private readonly projectsRepository: Repository<ProjectEntity>;
  private readonly projectCurrentRouteRepository: Repository<ProjectCurrentRouteEntity>;
  private readonly projectExecInRouteRepository: Repository<ExecInprojectRouteEntity>;
  private readonly projectActionRepository: Repository<ProjectActionEntity>;
  private readonly fileBlockRepository: Repository<FileBlockEntity>;

  constructor(
    @Inject(NotifyOrgProjectService)
    private readonly notifyOrgProjectService: NotifyOrgProjectService,
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
  ) {
    this.docRepository = dataSource.getRepository(DocEntity);
    this.fileBlockRepository = dataSource.getRepository(FileBlockEntity);
    this.projectCurrentRouteRepository = dataSource.getRepository(ProjectCurrentRouteEntity);
    this.projectExecInRouteRepository = dataSource.getRepository(ExecInprojectRouteEntity);

    this.projectsRepository = dataSource.getRepository(ProjectEntity);

    this.projectActionRepository = dataSource.getRepository(ProjectActionEntity);
  }

  async transformationRoute(route): Promise<Doc_route_actionType[]> {
    return route.map(async (el) => {
      const { name } = await this.projectActionRepository.findOne({
        where: {
          id: el.stage_id,
        },
      });
      return {
        action: {
          id: el.stage_id,
          label: name,
        },
        subAction: {
          cd1: el.flag_for_revision,
          cd2: el.flag_close,
          cd3: el.flag_with_remarks,
          cd4: el.flag_with_signature,
          cd5: el.flag_for_do,
        },
      };
    });
  }

  //проект может закрыть автор проекта и исполнитель на этапе проекта  (если очередь исполнителя)
  async checkAccessCloseProject(id: number, token: IToken): Promise<boolean> {
    const project = await this.projectsRepository.findOne({
      where: { id },
    });
    const { current_stage_id } = await this.projectsRepository.findOne({
      where: {
        id: id,
      },
    });
    const checkQeueVal = await checkQueue({
      manager: this.dataSource.manager,
      project_id: id,
      emp_id: token.current_emp_id,
      stage_id: current_stage_id,
    });
    if (checkQeueVal) {
      customError(projectMessageErr.MessQueue);
    }
    if (project.status_id == ProjectStatus.CLOSE || project.status_id == ProjectStatus.END_WORK) {
      customError(projectMessageErr.MessDontFix);
    }
    const execArr = await this.projectExecInRouteRepository.find({
      where: {
        stage_id: current_stage_id,
        project_id: id,
        executor_id: token.current_emp_id,
      },
    });

    return execArr.length > 0;
  }

  setQueryBuilderProjects(
    args: GetProjectsArgs,
    userId: number,
    orderBy: OrderProjectsInput,
    queryBuilder: SelectQueryBuilder<ProjectEntity>,
  ): void {
    const {
      currentStage,
      doc,
      dtc,
      short_body,
      flagStatus,
      executor,
      id,
      ids,
      nm,
      status,
      typeDocument,
      user,
      viewDocument,
    } = args;

    queryBuilder.leftJoinAndSelect("projects.Exec", "Exec");
    queryBuilder.leftJoinAndSelect("Exec.User", "E_user");
    queryBuilder.leftJoinAndSelect("E_user.Staff", "E_staff");
    queryBuilder.leftJoinAndSelect("Exec.post", "E_post");
    queryBuilder.leftJoinAndSelect("projects.Doc", "Doc");
    queryBuilder.leftJoinAndSelect("projects.Type_doc", "Type_doc");
    queryBuilder.leftJoinAndSelect("projects.View_doc", "View_doc");
    queryBuilder.leftJoinAndSelect("projects.Status", "Status");
    queryBuilder.leftJoinAndSelect("projects.CurrentStage", "CurrentStage");
    queryBuilder.leftJoin(
      "exec_in_project_route",
      "execInProjectRoute",
      "projects.id = execInProjectRoute.project_id",
    );

    queryBuilder.where("projects.del = :del", { del: false });
    queryBuilder.andWhere("projects.temp = :temp", { temp: false });

    if (id) {
      queryBuilder.andWhere("projects.id = :id", { id });
    }

    if (flagStatus !== TabsProject.ALL) {
      this.setWhereByStatus(queryBuilder, flagStatus);
    }

    if (dtc) {
      queryBuilder.andWhere("projects.dtc::date = :dtc", { dtc });
    }

    if (nm) {
      queryBuilder.andWhere("projects.nm ILIKE :nm", { nm: `%${nm}%` });
    }
    if (short_body) {
      queryBuilder.andWhere("projects.short_body ILIKE :short_body", {
        short_body: `%${short_body}%`,
      });
    }

    if (ids && ids?.length > 0) {
      queryBuilder.andWhere(`projects.id in ('${ids.join("', '")}')`);
    }

    if (typeDocument) {
      queryBuilder.andWhere("projects.type_document = :typeDocument", {
        typeDocument,
      });
    }

    if (viewDocument) {
      queryBuilder.andWhere("projects.view_document = :viewDocument", {
        viewDocument,
      });
    }

    if (status) {
      queryBuilder.andWhere("projects.status_id = :status", { status });
    }

    if (currentStage) {
      queryBuilder.andWhere("projects.current_stage_id = :currentStage", {
        currentStage,
      });
    }

    if (executor) {
      queryBuilder.andWhere(
        `(E_staff.ln || ' ' || E_staff.nm || ' ' || CONCAT(E_staff.mn) || ' / ' || E_post.nm) ILIKE :executor`,
        {
          executor: `%${executor}%`,
        },
      );
    }

    if (doc) {
      queryBuilder.andWhere("Doc.reg_num ILIKE :doc", { doc: `%${doc}%` });
    }

    if (user && user[0]) {
      queryBuilder.andWhere(new Brackets((qb) => this.setUserRole(qb, user, userId)));
    }

    this.getOrderAllProjects(queryBuilder, orderBy);
  }

  private setUserRole(qb: WhereExpressionBuilder, user: PartiesProjects[], userId: number): void {
    user.map((role) => {
      switch (role) {
        case PartiesProjects.CREATED:
          qb.where("projects.user_created_id = :userId", { userId }).andWhere(
            "projects.status_id NOT IN(:...project_status)",
            {
              project_status: [DocProject.COMPLETED, DocProject.CLOSED],
            },
          );
          break;
        case PartiesProjects.PARTICIPANT:
          this.setUserRoleParticipant(qb, userId);
          break;
        case PartiesProjects.PARTICIPANT_VISE:
          this.setUserRoleParticipant(qb, userId, ProjectActionEnum.VIS);
          break;
        case PartiesProjects.PARTICIPANT_SIGN:
          this.setUserRoleParticipant(qb, userId, ProjectActionEnum.SIGN);
          break;
        case PartiesProjects.PARTICIPANT_APPROVE:
          this.setUserRoleParticipant(qb, userId, ProjectActionEnum.APPROV);
          break;
      }
    });
  }

  private setUserRoleParticipant(
    qb: WhereExpressionBuilder,
    userId: number,
    stage: number = null,
  ): void {
    qb.where("execInProjectRoute.executor_id = :userId", { userId });
    qb.andWhere("execInProjectRoute.stage_id = projects.current_stage_id");
    qb.andWhere("projects.status_id NOT IN(:...project_status)", {
      project_status: [DocProject.COMPLETED, DocProject.CLOSED],
    });

    if (stage) {
      qb.andWhere("execInProjectRoute.stage_id = :stage", { stage });
    }
  }

  private getOrderAllProjects(
    queryBuilder: SelectQueryBuilder<ProjectEntity>,
    orderBy: OrderProjectsInput,
  ): void {
    if (!orderBy) {
      queryBuilder.orderBy("projects.id", SortEnum.DESC);
      return;
    }

    switch (orderBy.value) {
      case OrderProjectsEnum.id:
        queryBuilder.orderBy("projects.id", orderBy.sortEnum);
        break;
      case OrderProjectsEnum.dtc:
        queryBuilder.orderBy("projects.dtc", orderBy.sortEnum);
        break;
      case OrderProjectsEnum.nm:
        queryBuilder.orderBy("projects.nm", orderBy.sortEnum);
        break;
      case OrderProjectsEnum.short_body:
        queryBuilder.orderBy("projects.short_body", orderBy.sortEnum);
        break;

      case OrderProjectsEnum.typeDocument:
        queryBuilder.orderBy("Type_doc.nm", orderBy.sortEnum);
        break;
      case OrderProjectsEnum.viewDocument:
        queryBuilder.orderBy("View_doc.nm", orderBy.sortEnum);
        break;
      case OrderProjectsEnum.status:
        queryBuilder.orderBy("Status.nm", orderBy.sortEnum);
        break;
      case OrderProjectsEnum.currentStage:
        queryBuilder.orderBy("CurrentStage.name", orderBy.sortEnum);
        break;
      case OrderProjectsEnum.executor:
        queryBuilder.orderBy({
          "E_staff.ln": orderBy.sortEnum,
          "E_staff.nm": orderBy.sortEnum,
          "E_staff.mn": orderBy.sortEnum,
          "E_post.nm": orderBy.sortEnum,
        });
        break;
      case OrderProjectsEnum.doc:
        queryBuilder.orderBy("Doc.reg_num", orderBy.sortEnum);
        break;
      default:
        queryBuilder.orderBy("projects.id", SortEnum.DESC);
    }
  }

  /**
   * Проверка - Возможно ли отправить проект по маршруту
   * @param currentStage
   * @param project
   */
  async checkSendInRoute(
    currentStage: ProjectCurrentRouteEntity[],
    project: ProjectEntity,
  ): Promise<CheckSendRoute> {
    if (currentStage.length == 0) {
      return {
        flag: true,
        message: PREF_ERR + projectMessageErr.MessMoreOneStage,
      };
    }
    const arrStageId: number[] = currentStage.map((el) => {
      return el.stage_id;
    });

    for (const el of arrStageId) {
      const execInProjectRoute = await this.projectExecInRouteRepository.find({
        where: {
          project_id: project.id,
          stage_id: el,
        },
        order: {
          queue: "ASC",
        },
      });
      if (!execInProjectRoute.length) {
        return {
          flag: true,
          message: PREF_ERR + projectMessageErr.MessMoreExec,
        };
      }
    }
    const checkFileExist = await this.checkFileExist(project.id);
    if (!checkFileExist) {
      return {
        flag: true,
        message: PREF_ERR + projectMessageErr.MessMoreFile,
      };
    }
    return {
      flag: false,
      message: ``,
    };
  }

  /**
   * Проверка перехода на следующий этап проекта
   * @param id_project
   * @param emp_id
   */

  async checkNextStage(id_project: number, emp_id: number): Promise<void> {
    const project = await this.projectsRepository.findOne({
      where: {
        id: id_project,
      },
    });
    const execInProjectRoute = await this.projectExecInRouteRepository.find({
      where: {
        project_id: id_project,
        stage_id: project.current_stage_id,
      },
    });

    const checkdate_fact = execInProjectRoute.every(
      (el) => el.date_fact !== null && el.result !== null,
    );

    const stageAll = await this.projectCurrentRouteRepository.find({
      where: {
        project_id: id_project,
      },
    });
    const sortStage = stageAll.map((el) => el.stage_id);
    const indexStageInArr = sortStage.indexOf(project.current_stage_id);
    let new_stage_id = sortStage[indexStageInArr];

    if (checkdate_fact) {
      /**
       * завершение проекта
       */
      if (sortStage[sortStage.length - 1] == project.current_stage_id) {
        await this.projectsRepository.update(id_project, {
          status_id: ProjectStatus.END_WORK,
        });
        await this.createDocFromProject(id_project);

        // уведомление всем кроме инициатора
        await this.notifyOrgProjectService.addNotifyProjectAny({
          project_id: id_project,
          project_emp: [ProjectEmpEnum.all],
          exclude: [emp_id],
          notify_type_id: NotifyTypeEnum.PROJECT_END,
          message: "Проект № " + id_project + ": завершен",
          kind: PsBaseEnum.info,
        });
        return;
      }

      /**
       * переход к следующей стадии
       */
      if (indexStageInArr != sortStage.length - 1) {
        new_stage_id = sortStage[indexStageInArr + 1];
        await this.projectsRepository.update(id_project, {
          current_stage_id: new_stage_id,
        });
      }
    }

    // список исполнителей стадии, чья очередь на стадии
    const project_emp_list =
      (await this.projectExecInRouteRepository.find({
        where: {
          project_id: id_project,
          stage_id: new_stage_id,
          del: false,
          temp: false,
          date_fact: IsNull(),
        },
        order: {
          queue: "ASC",
        },
      })) ?? [];
    const min_queue = Math.min(...project_emp_list.map((item) => item.queue));
    const project_emp_list_min = project_emp_list.filter((item) => item.queue === min_queue);

    // название стадии
    const stage_name = (
      await this.projectActionRepository.findOneBy({ id: new_stage_id })
    ).name.toLowerCase();

    // уведомление исполнителям, чья очередь стадии
    await this.notifyOrgProjectService.addNotifyProjectAny({
      project_id: id_project,
      project_emp: [],
      include: project_emp_list_min.map((item) => item.executor_id),
      notify_type_id: NotifyTypeEnum.PROJECT_QUEUE_ADVANCE,
      message: "Проект № " + id_project + ": Ваша очередь - " + stage_name,
      kind: PsBaseEnum.warning,
    });
  }

  /**
   * Проверка на уникальность пользователя на разных этапах
   * Нельзя назначить одного и того же пользователя на разные этапы
   * @param project_id
   * @param stage_id
   * @param executor_id
   */
  async checkUniqueExecInStage(
    project_id: number,
    stage_id: number,
    executor_id: number,
  ): Promise<boolean> {
    const allExec = await this.projectExecInRouteRepository.find({
      where: {
        project_id: project_id,
      },
    });

    return allExec.some((el) => {
      return el.executor_id == executor_id;
    });
  }

  /**
   * Проверка на существование файла
   * @param project_id
   */
  async checkFileExist(project_id: number): Promise<number> {
    const file = await this.fileBlockRepository.find({
      where: {
        project_id: project_id,
      },
    });
    return file.length;
  }

  /**
   * проверка хронология даты.
   * @param project_id
   */

  async checkDate(project_id: number): Promise<boolean> {
    const datePlanInProject = [];
    const stageAll = await this.projectCurrentRouteRepository.find({
      where: {
        project_id: project_id,
      },
    });
    const sortStage = stageAll.map((el) => el.stage_id);

    for (const item of sortStage) {
      const arrExecInProject = await this.projectExecInRouteRepository.find({
        where: {
          project_id: project_id,
          stage_id: item,
        },
        order: { queue: "ASC" },
      });
      // Создаём массив только с уникальными очередями т.к. исполнителям с одинаковой очередью не нужна проверка на хронологию даты
      const uniqQueue = arrExecInProject.reduce((o, i) => {
        if (!o.find((v) => v.queue == i.queue)) {
          o.push(i);
        }
        return o;
      }, []);
      uniqQueue.forEach((el) => {
        const unixTime = parseInt((new Date(el.date_plan).getTime() / 1000).toFixed(0));
        datePlanInProject.push(unixTime);
      });
    }
    for (let i = 0; i < datePlanInProject.length - 1; i++) {
      if (datePlanInProject[i] > datePlanInProject[i + 1]) {
        return true;
      }
    }

    return false;
  }

  async findLastSign(project_id: number, manager: EntityManager): Promise<string> {
    const lastSigner = await manager.findOne(ExecInprojectRouteEntity, {
      where: {
        project_id,
        stage_id: 2,
        result: "Подписано",
      },
      order: {
        id: "DESC",
      },
    });
    if (lastSigner) {
      const emp = await manager.findOne(EmpEntity, {
        where: {
          id: lastSigner.executor_id,
        },
      });
      const user = await manager.findOne(UserEntity, {
        where: {
          current_emp_id: emp.id,
        },
      });
      const post = await manager.findOne(PostEntity, {
        where: {
          id: emp.post_id,
        },
      });
      const staff = await manager.findOne(StaffEntity, {
        where: {
          user_id: user.id,
        },
      });
      return `${staff.FIO} / ${post.nm}`;
    } else {
      const lastFile = await manager.findOne(FileBlockEntity, {
        where: {
          project_id,
          project_required: true,
        },
        order: {
          id: "DESC",
        },
      });
      if (lastFile) {
        const fileVersion = await manager.findOne(FileVersionEntity, {
          where: {
            file_block_id: lastFile.id,
          },
        });
        const fileItem = await manager.findOne(FileItemEntity, {
          where: {
            file_version_id: fileVersion.id,
          },
        });
        const sign = await manager.findOne(SignEntity, {
          where: {
            file_item_id: fileItem.id,
          },
        });
        if (sign && sign.info) {
          const info = JSON.parse(sign.info);
          return `${info.surname} ${info.name}`;
        }
      }
    }
    return null;
  }

  /**
   * СОЗДАТЬ ДОКУМЕНТ ИЗ ПРОЕКТА
   */
  async createDocFromProject(project_id: number): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      const project = await manager.findOne(ProjectEntity, {
        where: {
          id: project_id,
        },
      });
      const defaultProject = {
        del: false,
        temp: false,
        dtc: new Date(),
        cls_id: project.type_document,
        tdoc: project.view_document,
        author: project.executor_id,
        exec: project.executor_id,
        body: project.short_body,
        header: project.short_body,
        project_id: project_id,
        languages: project.languages,
        signed: await this.findLastSign(project_id, manager),
      };
      const doc = manager.create(DocEntity, defaultProject);
      const saveDoc = await manager.save(DocEntity, doc);

      const fileProject = await manager.find(FileBlockEntity, {
        where: {
          project_id: project_id,
          project_required: true,
        },
      });

      for (const el of fileProject) {
        await manager.update(FileBlockEntity, el.id, {
          // оставить ссылку на завершенный проект, добавить ссылку на созданный документ
          // project_id: null,
          doc_id: saveDoc.id,
          // project_required: false,
        });
      }

      return true;
    });
  }

  /**
   * Проверка: может ли участник конкретного этапа добавлять пользователя на этап
   */
  async checkAccessAddExec(
    project_id: number,
    stage_id: number,
    current_emp_id: number,
  ): Promise<boolean> {
    const project = await this.projectsRepository.findOne({
      where: {
        id: project_id,
      },
    });
    if (project.status_id === ProjectStatus.NEW || project.status_id === ProjectStatus.FIX) {
      return false;
    }
    const execInStageProject = await this.projectExecInRouteRepository.find({
      where: {
        project_id: project_id,
        stage_id: stage_id,
      },
    });
    return !execInStageProject.some((el) => el.executor_id == current_emp_id);
  }

  // функция для нахождения удалённого этапа
  checkDeleteAction(prevActionArr, newActionArr): number[] {
    // Создаем новый массив для хранения недостающих значений
    const missingValues = [];

    // Проходим по каждому элементу первого массива
    for (let i = 0; i < prevActionArr.length; i++) {
      const currentValue = prevActionArr[i];
      let found = false;

      // Проверяем, есть ли текущее значение во втором массиве
      for (let j = 0; j < newActionArr.length; j++) {
        if (newActionArr[j] === currentValue) {
          found = true;
          break;
        }
      }

      // Если текущее значение не найдено во втором массиве, добавляем его в missingValues
      if (!found) {
        missingValues.push(currentValue);
      }
    }

    return missingValues;
  }

  /**
   * Фильтр по вкладкам поручения.
   *
   * Вкладка «В работе» - Отображаются поручения в статусах отличных от «Закрыто».
   * Вкладка «Завершенные» - Отображаются поручения, имеющие статус «Закрыто».
   * Вкладка «Все» - Отображаются все поручения.
   */
  setWhereByStatus(queryBuilder: SelectQueryBuilder<ProjectEntity>, flagStatus: number): void {
    switch (flagStatus) {
      case TabsProject.CLOSED: // статус закрыт
        queryBuilder.andWhere("status_id IN (:...statusId)", {
          statusId: [ProjectStatus.END_WORK, ProjectStatus.CLOSE],
        });
        break;
      case TabsProject.IN_PROGRESS:
        queryBuilder.andWhere("status_id IN (:...statusId)", {
          statusId: [ProjectStatus.INWORK, ProjectStatus.NEW, ProjectStatus.FIX],
        });
        break;
    }
  }
  async checkUpdateExec(executor_id: number, token: IToken): Promise<boolean> {
    const execIncurrentStage = await this.projectExecInRouteRepository.findOne({
      where: {
        id: executor_id,
      },
    });
    // удаление самого себя в статусе (в работе) - запрещено
    if (execIncurrentStage.executor_id === token.current_emp_id) {
      return false;
    }

    return execIncurrentStage.parent_exec_id === token.current_emp_id;
  }
}
