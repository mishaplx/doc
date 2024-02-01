import { HttpException, HttpStatus, Inject, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DataSource, In, Repository } from "typeorm";

import { PsBaseEnum } from "../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { DocProject, PREF_ERR } from "../../common/enum/enum";
import {
  customError,
  isPrefErr,
  ResponseType,
  setErrorRest,
} from "../../common/type/errorHelper.type";
import { globalSearchProjectBuilderDoc } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { ExecInprojectRouteEntity } from "../../entity/#organization/project/execInprojectRoute.entity";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { LanguageEntity } from "../../entity/#organization/language/language.entity";
import { ProjectEntity } from "../../entity/#organization/project/project.entity";
import { ProjectActionEntity } from "../../entity/#organization/project/ProjectAction.entity";
import { ProjectCurrentRouteEntity } from "../../entity/#organization/project/ProjectcurrentRoute.entity";
import { ProjectSubActionEntity } from "../../entity/#organization/project/projectSubAction.entity";
import { TemplateRouteProjectEntity } from "../../entity/#organization/templateRouteProject/template_route_project.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { getAccessEnablingProject } from "../access/accessEnabling/accessEnabling.project";
import { FavoritesService } from "../favorites/favorites.service";
import { FileUploadService } from "../file/fileUpload/fileUpload.service";
import { wLogger } from "../logger/logging.module";
import { NotifyTypeEnum } from "../notify/notify.const";
import { NotifyOrgProjectService, ProjectEmpEnum } from "../notify/org/notifyOrgProject.service";
import { GetcurrentRouteDto } from "./dto/currentroute/getcurrentRoute.dto";
import { GetProjectsArgs } from "./dto/get-projects.args";
import { OrderProjectsInput } from "./dto/order-projects-request.dto";
import { PaginatedProjectsResponse } from "./dto/paginated-projects-response.dto";
import { ProjectUpdate } from "./dto/projects.dto";
import { ResponseProjectID } from "./dto/responseProjectID";
import { ProjectExecService } from "./projects.exec.service";
import { checkQueue } from "./utils/project.utils";
import { ProjectStatus, projectMessageErr } from "./projects.const";

export class ProjectsService {
  private readonly projectsRepository: Repository<ProjectEntity>;
  private readonly projectsTemplateRepository: Repository<TemplateRouteProjectEntity>;
  private readonly projectCurrentRouteRepository: Repository<ProjectCurrentRouteEntity>;
  private readonly projectSubActionRepository: Repository<ProjectSubActionEntity>;
  private readonly projectActionRepository: Repository<ProjectActionEntity>;
  private readonly projectExecinRouteRepository: Repository<ExecInprojectRouteEntity>;
  private readonly fileBlockRepository: Repository<FileBlockEntity>;
  private readonly EmpRepository: Repository<EmpEntity>;
  private readonly LanguageRepository: Repository<LanguageEntity>;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(NotifyOrgProjectService)
    private readonly notifyOrgProjectService: NotifyOrgProjectService,
    @Inject(FileUploadService)
    private readonly fileUploadService: FileUploadService,
    @Inject(FavoritesService)
    private FavoritesService: FavoritesService,
    private projectExecService: ProjectExecService,
  ) {
    this.LanguageRepository = dataSource.getRepository(LanguageEntity);
    this.EmpRepository = dataSource.getRepository(EmpEntity);
    this.projectsRepository = dataSource.getRepository(ProjectEntity);
    this.fileBlockRepository = dataSource.getRepository(FileBlockEntity);
    this.projectsTemplateRepository = dataSource.getRepository(TemplateRouteProjectEntity);
    this.projectCurrentRouteRepository = dataSource.getRepository(ProjectCurrentRouteEntity);
    this.projectSubActionRepository = dataSource.getRepository(ProjectSubActionEntity);
    this.projectActionRepository = dataSource.getRepository(ProjectActionEntity);
    this.projectExecinRouteRepository = dataSource.getRepository(ExecInprojectRouteEntity);
  }

  async getAllProjects(
    args: GetProjectsArgs,
    pagination: PaginationInput,
    orderBy: OrderProjectsInput,
    userId: number,
    searchField: string,
  ): Promise<PaginatedProjectsResponse> {
    const queryBuilder = this.projectsRepository.createQueryBuilder("projects");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchProjectBuilderDoc(queryBuilder, searchField);
    } else {
      this.projectExecService.setQueryBuilderProjects(args, userId, orderBy, queryBuilder);
    }
    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [projects, total] = await queryBuilder.getManyAndCount();
    //@TODO Костыль для преобразования этапов при определённых статусах
    projects.forEach((el) => {
      if ([DocProject.REVISION, DocProject.COMPLETED, DocProject.CLOSED].includes(el.status_id)) {
        el.current_stage_id = null;
        el.CurrentStage = null;
      }
    });

    return paginatedResponseResult(projects, pageNumber, pageSize, total);
  }

  /**
   * ПРОЕКТ: ПРОЧИТАТЬ
   */
  async getProjectsById(
    token: IToken,
    project_id: number,
  ): Promise<HttpException | ResponseProjectID> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { id: project_id },
      });
      if (!project) customError("Не найден проект документа № " + project_id);

      // ДОСТУПНЫЕ ОПЕРАЦИИ
      project.EnablingActions = await getAccessEnablingProject({
        emp_id: token.current_emp_id,
        manager: this.dataSource.manager,
        projectEntity: project,
      });

      const routeProjectInDb = await this.projectCurrentRouteRepository.find({
        where: {
          project_id: project_id,
        },
      });

      const Route = await this.projectExecService.transformationRoute(routeProjectInDb);

      project.isFavorites = await this.FavoritesService.isFavorite(token, null, null, project_id);

      return { project, Route };
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  async createProject(userId: number): Promise<ProjectEntity> {
    try {
      const lang = await this.LanguageRepository.findOne({ where: { nm: "Русский" } });
      const date = new Date();
      const newProject = this.projectsRepository.create({
        status_id: ProjectStatus.NEW,
        languages: [{ label: lang.nm, id: lang.id }],
        user_created_id: userId,
        dtc: date,
      });

      return await this.projectsRepository.save(newProject);
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  async saveProject(flagButton: number, projectItem: ProjectUpdate) {
    try {
      const { type_document, view_document, executor, id } = projectItem;
      const project = await this.projectsRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!project) customError("Не найден проект документа № " + id);

      if (project.status_id == ProjectStatus.INWORK) {
        throw new UnprocessableEntityException(PREF_ERR + projectMessageErr.MessInJob);
      }
      if (flagButton === 3) {
        const prev = await this.projectCurrentRouteRepository.find({
          where: {
            project_id: projectItem.id,
          },
        });
        const prevArr = prev.map((el) => {
          return el.stage_id;
        });
        const current = projectItem.route_project.map((el) => {
          return el.action.id;
        });
        const arr = this.projectExecService.checkDeleteAction(prevArr, current);
        // проверка на существования исполнителей на этапе который хочет удалить пользователь
        const checkExec = await this.projectExecinRouteRepository.find({
          where: {
            project_id: projectItem.id,
            stage_id: arr[0],
          },
        });
        if (checkExec.length) {
          return new HttpException(
            `${PREF_ERR} Удалите исполнителей на текущем этапе`,
            HttpStatus.BAD_REQUEST,
          );
        }
        await this.projectExecinRouteRepository.delete({
          project_id: projectItem.id,
          stage_id: In(arr),
        });
      }
      const number = `Проект/${id}`;
      const route = projectItem.route_project;
      const projectID = id;
      const date = new Date();
      const routeInDb = await this.projectCurrentRouteRepository.find({
        where: {
          project_id: projectID,
        },
      });
      if (routeInDb.length == 0) {
        for (const elem of route) {
          const saveRoute = this.projectCurrentRouteRepository.create({
            project_id: projectID,
            stage_id: elem.action.id,
            flag_for_do: elem.subAction.cd5,
            flag_close: elem.subAction.cd2,
            flag_with_remarks: elem.subAction.cd3,
            flag_with_signature: elem.subAction.cd4,
            flag_for_revision: elem.subAction.cd1,
          });
          await this.projectCurrentRouteRepository.save(saveRoute);
        }
      } else {
        for (const el of routeInDb) {
          await this.projectCurrentRouteRepository.delete({ id: el.id });
        }
        for (const elem of route) {
          const saveRoute = this.projectCurrentRouteRepository.create({
            project_id: projectID,
            stage_id: elem.action.id,
            flag_for_revision: elem.subAction.cd1,
            flag_close: elem.subAction.cd2,
            flag_with_remarks: elem.subAction.cd3,
            flag_with_signature: elem.subAction.cd4,
            flag_for_do: elem.subAction.cd5,
          });
          await this.projectCurrentRouteRepository.save(saveRoute);
        }
      }

      await this.projectsRepository.update(
        {
          id: projectID,
        },
        {
          temp: false,
          number: number,
          type_document: type_document,
          view_document: view_document,
          is_sing_date: projectItem.isSign ? projectItem.is_sing_date : null,
          executor_id: executor,
          status_id: project.status_id == ProjectStatus.FIX ? ProjectStatus.FIX : ProjectStatus.NEW,
          nm: projectItem.nm,
          dtc: date,
          short_body: projectItem.short_body,
          route_project_name: projectItem.route_project_name || "",
          languages: projectItem.languages,
        },
      );
      const result: ProjectEntity = await this.projectsRepository.findOne({
        where: {
          id: projectItem.id,
        },
      });
      const copyObj: ProjectEntity = Object.assign({}, result);
      copyObj.Route = projectItem.route_project;

      return copyObj;
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  async updateProject(
    projectItem: ProjectUpdate,
    flagButton: number,
  ): Promise<ProjectEntity | HttpException> {
    if (projectItem.isSign) {
      projectItem.is_sing_date = new Date();
    } else {
      projectItem.is_sing_date = null;
    }
    if (flagButton == 1 || flagButton == 3) {
      return await this.saveProject(flagButton, projectItem);
    }

    if (flagButton == 2) {
      await this.projectsRepository.update({ id: projectItem.id }, projectItem);
    }

    return this.projectsRepository.findOneByOrFail({ id: projectItem.id });
  }

  /**
   * ЗАКРЫТЬ ПРОЕКТ
   */
  async closeProject(id: number, remark: string, token: IToken): Promise<boolean | HttpException> {
    try {
      const { short_body } = await this.projectsRepository.findOne({
        where: {
          id: id,
        },
      });
      const author_project = await this.projectsRepository.findOne({
        where: {
          id: id,
          executor_id: token.current_emp_id,
        },
      });
      if (author_project) {
        if (remark.length != 0) {
          const textResultShortBody = `${short_body} - Проект закрыт  с комментарием - ${remark}`;
          await this.projectsRepository.update(id, {
            short_body: textResultShortBody,
            status_id: ProjectStatus.CLOSE,
          });
        } else {
          const textResultShortBody = `${short_body} - Проект закрыт без комментария`;
          await this.projectsRepository.update(id, {
            short_body: textResultShortBody,
          });
        }
      } else {
        const checkAccessCloseProject = await this.projectExecService.checkAccessCloseProject(
          id,
          token,
        );
        //проверка на закрытие проекта
        if (!checkAccessCloseProject) {
          return new HttpException(
            `${PREF_ERR} вы не можете закрыть проект`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (remark.length != 0) {
          const textResultShortBody = `${short_body} - Проект закрыт  с комментарием - ${remark}`;
          await this.projectsRepository.update(id, {
            short_body: textResultShortBody,
            status_id: ProjectStatus.CLOSE,
          });
        } else {
          const textResultShortBody = `${short_body} - Проект закрыт без комментария`;
          await this.projectsRepository.update(id, {
            short_body: textResultShortBody,
          });
        }
      }

      // уведомление всем кроме инициатора
      await this.notifyOrgProjectService.addNotifyProjectAny({
        project_id: id,
        project_emp: [ProjectEmpEnum.all],
        exclude: [token.current_emp_id],
        notify_type_id: NotifyTypeEnum.PROJECT_CLOSE,
        message: "Проект № " + id + ": закрыт",
        kind: PsBaseEnum.info,
      });

      return true;
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  async getCorrectRoute(id_type_doc: number, id_view_doc: number): Promise<GetcurrentRouteDto[]> {
    try {
      const result: TemplateRouteProjectEntity[] = await this.projectsTemplateRepository.find({
        where: {
          type_document: id_type_doc,
          view_document: id_view_doc,
        },
      });
      const arrResult: any = [];
      for (const el of result) {
        const doc_route_action: any = [];
        const name = el.name;
        const id = el.id;
        const doc_route_actionarr = el.doc_route_action;
        for (const item of doc_route_actionarr) {
          const nameAction = await this.projectActionRepository.findOne({
            where: {
              id: item.action,
            },
          });

          const action: { id: number; label: string } = {
            id: nameAction.id,
            label: nameAction.name,
          };

          const subAction: Record<string, boolean> = {
            cd1: item.subAction[0]?.flag || false,
            cd2: item.subAction[1]?.flag || false,
            cd3: item.subAction[2]?.flag || false,
            cd4: item.subAction[3]?.flag || false,
            cd5: item.subAction[4]?.flag || false,
          };
          doc_route_action.push({ action, subAction });
        }
        arrResult.push({ name, id, doc_route_action });
      }
      return arrResult;
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  /**
   * ОТПРАВИТЬ ПО МАРШРУТУ
   */
  async sendToRoute(
    id_project: number,
    isSign: boolean,
    token: IToken,
  ): Promise<boolean | HttpException> {
    const stageProject = await this.projectCurrentRouteRepository.find({
      where: {
        project_id: id_project,
      },
    });
    const project = await this.projectsRepository.findOne({
      where: {
        id: id_project,
      },
    });

    if (
      !(
        project.executor_id == token.current_emp_id ||
        project.user_created_id == token.current_emp_id
      )
    ) {
      return new HttpException(PREF_ERR + projectMessageErr.MessSendRoute, HttpStatus.BAD_REQUEST);
    }

    const check = await this.projectExecService.checkSendInRoute(stageProject, project);
    if (check.flag) {
      return new HttpException(check.message, HttpStatus.BAD_REQUEST);
    }
    const checkDate = await this.projectExecService.checkDate(id_project);
    if (checkDate) {
      return new HttpException(PREF_ERR + projectMessageErr.MessErrDate, HttpStatus.BAD_REQUEST);
    }

    const updateObj: {
      status_id: number;
      current_stage_id: number;
      is_sing_date: Date | null;
    } = {
      status_id: ProjectStatus.INWORK,
      current_stage_id: stageProject[0].stage_id,
      is_sing_date: null,
    };
    if (isSign) {
      updateObj.is_sing_date = new Date();
    } else {
      updateObj.is_sing_date = null;
    }
    await this.projectsRepository.update(id_project, updateObj);

    // уведомление всем кроме инициатора
    await this.notifyOrgProjectService.addNotifyProjectAny({
      project_id: id_project,
      project_emp: [ProjectEmpEnum.all],
      exclude: [token.current_emp_id],
      notify_type_id: NotifyTypeEnum.PROJECT_EXEC_ADD,
      message: "Проект № " + id_project + ": Вы участник",
      kind: PsBaseEnum.info,
    });

    // список исполнителей первой стадии, чья очередь
    const stageAll = await this.projectCurrentRouteRepository.findBy({ project_id: id_project });
    const sortStage = stageAll.map((el) => el.stage_id);
    const project_emp_list =
      (await this.projectExecinRouteRepository.findBy({
        project_id: id_project,
        stage_id: sortStage[0],
        del: false,
        temp: false,
      })) ?? [];
    const min_queue = Math.min(...project_emp_list.map((item) => item.queue));
    const project_emp_list_min = project_emp_list.filter((item) => item.queue === min_queue);

    // название стадии
    const stage_name = (
      await this.projectActionRepository.findOneBy({ id: sortStage[0] })
    ).name.toLowerCase();

    // уведомление на рассмотрение первым в очереди
    await this.notifyOrgProjectService.addNotifyProjectAny({
      project_id: id_project,
      project_emp: [],
      include: project_emp_list_min.map((item) => item.executor_id),
      notify_type_id: NotifyTypeEnum.PROJECT_QUEUE_ADVANCE,
      message: "Проект № " + id_project + ": Ваша очередь - " + stage_name,
      kind: PsBaseEnum.warning,
    });

    return true;
  }

  /********************************************
   * ПОДПИСАТЬ, ВИЗИРОВАТЬ, УТВЕРДИТЬ: С ЗАМЕЧАНИЯМИ (REST)
   ********************************************/
  async stageWithRemark(args: {
    res: Response;
    file: Express.Multer.File[];
    remark: string;
    id_stage: number;
    id_project: number;
    token: IToken;
  }): Promise<any> {
    const { file, id_project, id_stage, remark, token, res } = args;
    try {
      const checkQeueVal = await checkQueue({
        manager: this.dataSource.manager,
        project_id: id_project,
        emp_id: token.current_emp_id,
        stage_id: id_stage,
      });
      if (checkQeueVal) {
        // const response = new ResponseType(
        //   HttpStatus.BAD_REQUEST,
        //   projectMessageErr.MessQueue,
        //   customError(projectMessageErr.MessQueue),
        // );
        // delete response.file_id;
        return res.send(
          new ResponseType(
            400,
            PREF_ERR + projectMessageErr.MessQueue,
            PREF_ERR + projectMessageErr.MessQueue,
          ),
        );
      }
      const projectExecEntity = await this.projectExecinRouteRepository.findOne({
        where: {
          project_id: id_project,
          stage_id: id_stage,
          executor_id: token.current_emp_id,
        },
      });
      let projectAction = await this.projectActionRepository.find();
      projectAction = projectAction.sort((a, b) => {
        return a.id - b.id;
      });
      // загрузить файл

      if (file.length) {
        await this.fileUploadService.uploadFileExec({
          files: [file[0]],
          param: { idProjectExec: projectExecEntity.id },
          token: token,
          file_block_one: true, // удалить старый файловый блок
        });
      }

      await this.projectExecinRouteRepository.update(projectExecEntity.id, {
        remark: remark,
        result: projectAction[id_stage - 1].do_name + " c замечаниями",
        date_fact: new Date(),
      });
      await this.projectExecService.checkNextStage(id_project, token.current_emp_id);

      return res.send(new ResponseType(201, "", "Замечания приняты"));
    } catch (err) {
      setErrorRest({
        msg: isPrefErr(err?.message) ? err?.message : PREF_ERR + projectMessageErr.MessForbidden,
        err: err,
        res: res,
      });
    }
  }

  /********************************************
   * ВИЗИРОВАТЬ, ПОДПИСАТЬ, УТВЕРДИТЬ
   ********************************************/
  async stageWithConfirm(
    id_project: number,
    id_stage: number,
    token: IToken,
    note?: string,
    sign?: string,
  ): Promise<boolean | HttpException> {
    try {
      const checkQueueVal = await checkQueue({
        manager: this.dataSource.manager,
        project_id: id_project,
        emp_id: token.current_emp_id,
        stage_id: id_stage,
      });

      if (checkQueueVal) {
        return new HttpException(PREF_ERR + projectMessageErr.MessQueue, HttpStatus.BAD_REQUEST);
      }
      const stage = await this.projectExecinRouteRepository.findOne({
        where: {
          project_id: id_project,
          stage_id: id_stage,
          executor_id: token.current_emp_id,
        },
      });

      let projectAction = await this.projectActionRepository.find();
      projectAction = projectAction.sort((a, b) => {
        return a.id - b.id;
      });
      await this.projectExecinRouteRepository.update(stage.id, {
        result: projectAction[id_stage - 1].do_name,
        date_fact: new Date(),
      });

      await this.projectExecService.checkNextStage(id_project, token.current_emp_id);
      return true;
    } catch (e) {
      wLogger.error(e);
      throw new UnprocessableEntityException(PREF_ERR + projectMessageErr.MessForbidden);
    }
  }

  /********************************************
   * ВИЗИРОВАТЬ, ПОДПИСАТЬ, УТВЕРДИТЬ: НА ДОРАБОТКУ (REST)
   ********************************************/
  async stageWithRevision(args: {
    file: Express.Multer.File;
    id_project: number;
    id_stage: number;
    remark: string;
    token: IToken;
    res: Response;
  }): Promise<ExecInprojectRouteEntity | HttpException | ResponseType> {
    const { file, id_project, id_stage, remark, token } = args;
    const checkQeueVal = await checkQueue({
      manager: this.dataSource.manager,
      project_id: id_project,
      emp_id: token.current_emp_id,
      stage_id: id_stage,
    });
    if (checkQeueVal) {
      return new HttpException(PREF_ERR + projectMessageErr.MessQueue, HttpStatus.BAD_REQUEST);
    }

    const projectExecEntity = await this.projectExecinRouteRepository.findOne({
      where: {
        project_id: id_project,
        stage_id: id_stage,
        executor_id: token.current_emp_id,
      },
    });

    // загрузить файл
    if (file) {
      await this.fileUploadService.uploadFileExec({
        files: [file],
        param: { idProjectExec: projectExecEntity.id },
        token: token,
        file_block_one: true, // удалить старый файловый блок
      });
    }

    //При отправке на доработку указывается только время и замечание
    await this.projectExecinRouteRepository.update(projectExecEntity.id, {
      remark: remark,
      date_fact: new Date(),
    });
    const arrExec = await this.projectExecinRouteRepository.find({
      where: {
        project_id: id_project,
      },
      order: {
        id: "ASC",
      },
    });
    await this.projectsRepository.update(id_project, {
      status_id: ProjectStatus.FIX,
      current_stage_id: arrExec[0].stage_id,
    });

    for (const execInprojectRouteEntity of arrExec) {
      await this.projectExecinRouteRepository.update(execInprojectRouteEntity.id, {
        result: null,
      });
    }

    // уведомление всем кроме инициатора
    await this.notifyOrgProjectService.addNotifyProjectAny({
      project_id: id_project,
      project_emp: [ProjectEmpEnum.all],
      exclude: [token.current_emp_id],
      notify_type_id: NotifyTypeEnum.PROJECT_RET_REWORK,
      message: "Проект № " + id_project + ": возвращено на доработку",
      kind: PsBaseEnum.error,
    });

    return new ResponseType(201, "", "Возвращено на доработку");
  }

  /********************************************
   * УДАЛИТЬ
   ********************************************/
  async deleteProject(project_id: number): Promise<HttpException | boolean> {
    try {
      const { status_id } = await this.projectsRepository.findOne({
        where: { id: project_id },
      });
      if (status_id != ProjectStatus.NEW) {
        return new HttpException(
          PREF_ERR + projectMessageErr.MessDeleteProject,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.projectsRepository.update(project_id, { del: true });
      return true;
    } catch (e) {
      wLogger.error(e);
      return new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
  // async stageWithConfirmAndSign(
  //   stage: ExecInprojectRouteEntity,
  //   note: string,
  //   sign: string,
  // ) {
  //   await this.projectExecinRouteRepository.update(stage.id, {
  //     result: projectAction[id_stage - 1].do_name,
  //
  //     date_fact: new Date(),
  //   });
  // }
}
