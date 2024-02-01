import { Inject, Injectable } from "@nestjs/common";
import { DataSource, EntityManager } from "typeorm";

import { PsBaseEnum } from "../../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { ProjectEntity } from "../../../entity/#organization/project/project.entity";
import { ProjectActionEnum } from "../../projects/projects.const";
import { NotifyTypeEnum } from "../notify.const";
import { NotifyOrgService } from "./notifyOrg.service";

/** Заинтересованные по поручению */
export enum ProjectEmpEnum {
  /** Все */
  all = 1,
  /** Создатель */
  creator = 2,
  /** Исполнители: все */
  exec_all = 3,
  /** Исполнители: визирование */
  exec_vis = 4,
  /** Исполнители: подписание */
  exec_sign = 5,
  /** Исполнители: утверждение */
  exec_approv = 6,
}

/**
 * СТРУКТУРА ДЛЯ СОХРАНЕНИЯ СОСТОЯНИЯ
 */
export interface INotifyOrgProject {
  job_id: number;
  manager: EntityManager;
  exec?: number[];
  resp?: number;
  control?: number;
  precontrol?: number;
}

@Injectable()
export class NotifyOrgProjectService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
  ) {}

  /**
   * ДОБАВИТЬ УВЕДОМЛЕНИЯ О СОБЫТИЯХ
   * ОБЩИЙ СЛУЧАЙ
   * @param(project_emp) - категории заинтересованных
   * @param(include) number[] - включить в список конкретные emp_id
   * @param(exclude) number[] - исключить из списка конкретные emp_id
   */
  async addNotifyProjectAny(args: {
    project_id: number;
    project_emp?: ProjectEmpEnum[];
    include?: number[];
    exclude?: number[];
    notify_type_id: NotifyTypeEnum;
    message: string;
    kind?: PsBaseEnum;
  }): Promise<void> {
    const {
      project_id,
      project_emp = [ProjectEmpEnum.all],
      include = [],
      exclude = [],
      notify_type_id,
      message,
      kind = PsBaseEnum.info,
    } = args;
    await this.notifyOrgService.addNotify({
      notify_type_id,
      emp_ids: await this.getRelEmp({
        project_id,
        project_emp: project_emp,
        include,
        exclude,
      }),
      project_id,
      message,
      kind,
    });
  }

  // /**
  //  * ЗАПОМНИТЬ СОСТОЯНИЕ EMP-СТАТУСОВ ПРОЕКТА
  //  * @param args
  //  * @returns
  //  */
  // async memoNotifyProjectStatus(args: {
  //   manager: EntityManager;
  //   project_id: number;
  // }): Promise<INotifyOrgProject> {
  //   const { manager, project_id } = args;
  //   const ret: INotifyOrgProject = { project_id, manager };
  //   const jobEntity = await manager.findOneByOrFail(JobEntity, { id: project_id, del: false });

  //   const execJobEntity = await jobEntity.ExecJobActual;
  //   ret.exec = execJobEntity.map((item) => item.emp_id) ?? [];
  //   ret.resp = execJobEntity.filter((item) => item.is_responsible)?.at(0)?.emp_id;

  //   const jobControlEntity = await jobEntity.JobControlLast;
  //   ret.control = jobControlEntity?.controller_id;
  //   ret.precontrol = jobControlEntity?.prev_controller_id;

  //   return ret;
  // }

  // /**
  //  * НУЛЕВОЕ СОСТОЯНИЕ EMP-СТАТУСОВ ПРОЕКТА
  //  * @param args
  //  * @returns
  //  */
  // async memoNotifyJobStatusNull(args: {
  //   manager: EntityManager;
  //   job_id: number;
  // }): Promise<INotifyOrgProject> {
  //   return {
  //     ...args,
  //     exec: [],
  //     resp: null,
  //     control: null,
  //     precontrol: null,
  //   } as INotifyOrgProject;
  // }

  /**
   * НАЙТИ EMP_ID ВСЕХ АКТУАЛЬНЫХ УНИКАЛЬНЫХ ПРИЧАСТНЫХ К ПРОЕКТУ
   * @param(project_emp) - категории заинтересованных
   * @param(include) number[] - включить в список конкретные emp_id
   * @param(exclude) number[] - исключить из списка конкретные emp_id
   */
  async getRelEmp(args: {
    project_id: number;
    project_emp?: ProjectEmpEnum[];
    include?: number[];
    exclude?: number[];
  }): Promise<number[]> {
    const { project_id, project_emp = [ProjectEmpEnum.all], include = [], exclude = [] } = args;
    let ret: number[] = [];
    const isAll = project_emp.includes(ProjectEmpEnum.all);
    const projectEntity = await this.dataSource.manager.findOneByOrFail(ProjectEntity, {
      id: project_id,
    });
    const projectExecEntity = await projectEntity.ProjectExec;

    // создатель (его можно поменять)
    if (isAll || project_emp.includes(ProjectEmpEnum.creator)) {
      ret.push(projectEntity.executor_id);
    }

    // исполнители: визирование
    if (
      isAll ||
      project_emp.includes(ProjectEmpEnum.exec_all) ||
      project_emp.includes(ProjectEmpEnum.exec_vis)
    ) {
      ret = ret.concat(
        projectExecEntity
          ?.filter((item) => !item.del && !item.temp && item.stage_id == ProjectActionEnum.VIS)
          ?.map((item) => item.executor_id) ?? [],
      );
    }

    // исполнители: подписание
    if (
      isAll ||
      project_emp.includes(ProjectEmpEnum.exec_all) ||
      project_emp.includes(ProjectEmpEnum.exec_sign)
    ) {
      ret = ret.concat(
        projectExecEntity
          ?.filter((item) => !item.del && !item.temp && item.stage_id == ProjectActionEnum.SIGN)
          ?.map((item) => item.executor_id) ?? [],
      );
    }

    // исполнители: утверждение
    if (
      isAll ||
      project_emp.includes(ProjectEmpEnum.exec_all) ||
      project_emp.includes(ProjectEmpEnum.exec_approv)
    ) {
      ret = ret.concat(
        projectExecEntity
          ?.filter((item) => !item.del && !item.temp && item.stage_id == ProjectActionEnum.APPROV)
          ?.map((item) => item.executor_id) ?? [],
      );
    }

    // добавить конкретные emp_id
    if (include.length > 0) {
      ret = ret.concat(include);
    }

    // исключить нулевые значения, повторы и exclude_any
    ret = ret.filter(
      (item, pos) => ret.indexOf(item) == pos && exclude.indexOf(item) == -1 && item,
    );
    return ret;
  }
}
