import { Inject, Injectable } from "@nestjs/common";
import { DataSource, EntityManager } from "typeorm";

import { PsBaseEnum } from "../../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { JobStatus } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { NotifyTypeEnum } from "../notify.const";
import { NotifyOrgService } from "./notifyOrg.service";

/** Заинтересованные по поручению */
export enum JobEmpEnum {
  /** Все */
  all = 1,
  /** Создатель */
  creator = 2,
  /** Автор */
  author = 3,

  /** Исполнители: все */
  exec_all = 4,
  /** Исполнители: обычные */
  exec_simple = 5,
  /** Исполнители: ответственный */
  exec_respons = 6,

  /** Контроль: все */
  control_all = 7,
  /** Контроль: контролер */
  control_main = 8,
  /** Контроль: предконтролер */
  control_pre = 9,
}

export const addNotifyJobAnyNum = "<num>";

/**
 * СТРУКТУРА ДЛЯ СОХРАНЕНИЯ СОСТОЯНИЯ
 */
export interface INotifyOrgJob {
  job_id: number;
  manager: EntityManager;
  exec?: number[];
  resp?: number;
  control?: number;
  precontrol?: number;
}

@Injectable()
export class NotifyOrgJobService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
  ) {}

  /**
   * ДОБАВИТЬ УВЕДОМЛЕНИЯ О СОБЫТИЯХ
   * ОБЩИЙ СЛУЧАЙ
   * @param(job_emp) - категории заинтересованных
   * @param(include) number[] - включить в список конкретные emp_id
   * @param(exclude) number[] - исключить из списка конкретные emp_id
   */
  async addNotifyJobAny(args: {
    job_id: number;
    job_emp?: JobEmpEnum[];
    include?: number[];
    exclude?: number[];
    notify_type_id: NotifyTypeEnum;
    message: string;
    kind?: PsBaseEnum;
  }): Promise<void> {
    const {
      job_id,
      job_emp = [JobEmpEnum.all],
      include = [],
      exclude = [],
      notify_type_id,
      message,
      kind = PsBaseEnum.info,
    } = args;

    // номер поручения
    const jobEnityNum = await this.dataSource.manager.findOneOrFail(JobEntity, {
      select: { num: true },
      where: { id: args.job_id },
    });

    await this.notifyOrgService.addNotify({
      notify_type_id,
      emp_ids: await this.getRelEmp({
        job_id,
        job_emp: job_emp,
        include,
        exclude,
      }),
      job_id,
      message: message.replaceAll(addNotifyJobAnyNum, jobEnityNum.num.toString()),
      kind,
    });
  }

  /**
   * ДОБАВИТЬ УВЕДОМЛЕНИЯ ОБ ИЗМЕНЕНИИ EMP-СТАТУСОВ
   * ЧАСТНЫЙ СЛУЧАЙ
   * ПЕРСОНАЛЬНО - В ОТНОШЕНИИ КОГО ПРОИЗВЕДЕНЫ ИЗМЕНЕНИЯ
   * ОСТАЛЬНЫМ - ИНФОРМАТИВНО
   * @param(memo) - сформированный методом memoNotifyJobStatus объект с преждним состоянем поручения
   * @param(job_emp) - проверяемые статусы
   * @param(manager) - источник данных (указывать если поменялся)
   */
  async addNotifyJobStatus(args: {
    memo: INotifyOrgJob;
    job_emp?: JobEmpEnum[];
    manager?: EntityManager;
  }): Promise<void> {
    const { memo, job_emp = [JobEmpEnum.all], manager: manager_new } = args;
    const { job_id, manager: manager_old, ...a } = memo;
    const manager = manager_new ? manager_new : manager_old;
    const b: {
      exec: number[];
      resp: number;
      control: number;
      precontrol: number;
    } = {
      exec: [],
      resp: null,
      control: null,
      precontrol: null,
    };

    // статус "В работе" - выход
    const jobEntity = await manager.findOneByOrFail(JobEntity, { id: job_id });
    if (
      [
        JobStatus.IN_PROGRESS,
        JobStatus.ON_APPROVAL,
        JobStatus.ON_REWORK,
        JobStatus.APPROVED,
      ].includes(jobEntity.status_id)
    )
      return;

    const isAll = job_emp.includes(JobEmpEnum.all);
    const isExecAll = job_emp.includes(JobEmpEnum.exec_all);
    const isControlAll = job_emp.includes(JobEmpEnum.control_all);

    let msg: string;

    const execJobEntity = await jobEntity.ExecJobActual;
    b.exec = execJobEntity.map((item) => item.emp_id) ?? [];
    b.resp = execJobEntity.filter((item) => item.is_responsible)?.at(0)?.emp_id;

    /**
     * ИСПОЛНИТЕЛЬ: ОТВЕТСТВЕННЫЙ
     */
    if (isAll || isExecAll || job_emp.includes(JobEmpEnum.exec_respons)) {
      msg = "Изменен ответственный исполнитель";
      if (!a.resp && b.resp) msg = "добавлен ответственный исполнитель";
      if (a.resp && !b.resp) msg = "удален ответственный исполнитель";

      // ответственный исполнитель изменен
      if (a.resp != b.resp) {
        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_RESP,
          emp_ids: [b.resp],
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": Вы ответственный исполнитель",
          kind: PsBaseEnum.warning,
        });
        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_RESP,
          emp_ids: [a.resp],
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": Вы не ответственный исполнитель",
          kind: PsBaseEnum.warning,
        });
        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_RESP,
          emp_ids: await this.getRelEmp({
            job_id: job_id,
            exclude: [a.resp, b.resp],
          }),
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": " + msg,
          kind: PsBaseEnum.info,
        });
      }
    }

    /**
     * ИСПОЛНИТЕЛЬ: ОБЫЧНЫЙ
     */
    if (isAll || isExecAll || job_emp.includes(JobEmpEnum.exec_simple)) {
      // исключить нулевые значения, повторы, ответственного исполнителя, новых (старых) исполнителей
      const exec_old2 = a.exec.filter(
        (item, pos) =>
          a.exec.indexOf(item) == pos && b.exec.indexOf(item) == -1 && a.resp != item && item,
      );
      const exec_new2 = b.exec.filter(
        (item, pos) =>
          b.exec.indexOf(item) == pos && a.exec.indexOf(item) == -1 && b.resp != item && item,
      );

      // уведомления при изменении исполнителя
      await this.notifyOrgService.addNotify({
        notify_type_id: NotifyTypeEnum.JOB_STATUS_EXEC,
        emp_ids: exec_new2,
        job_id: job_id,
        message: "Поручение № " + jobEntity.num + ": Вы исполнитель",
        kind: PsBaseEnum.warning,
      });
      await this.notifyOrgService.addNotify({
        notify_type_id: NotifyTypeEnum.JOB_STATUS_EXEC,
        emp_ids: exec_old2,
        job_id: job_id,
        message: "Поручение № " + jobEntity.num + ": Вы не исполнитель",
        kind: PsBaseEnum.warning,
      });
    }

    const jobControlEntity = await jobEntity.JobControlLast;
    b.control = jobControlEntity?.controller_id;
    b.precontrol = jobControlEntity?.prev_controller_id;

    /**
     * КОНТРОЛЬ: КОНТРОЛЕР
     */
    if (isAll || isControlAll || job_emp.includes(JobEmpEnum.control_main)) {
      if (a.control != b.control) {
        msg = "Изменен контролер";
        if (!a.control && b.control) msg = "добавлен контролер";
        if (a.control && !b.control) msg = "удален контролер";

        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_CONTROL,
          emp_ids: [b.control],
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": Вы контролер",
          kind: PsBaseEnum.warning,
        });
        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_CONTROL,
          emp_ids: [a.control],
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": Вы не контролер",
          kind: PsBaseEnum.warning,
        });
        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_CONTROL,
          emp_ids: await this.getRelEmp({
            job_id: job_id,
            exclude: [a.control, b.control],
          }),
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": " + msg,
          kind: PsBaseEnum.info,
        });
      }
    }

    /**
     * КОНТРОЛЬ: ПРЕДКОНТРОЛЕР
     */
    if (isAll || isControlAll || job_emp.includes(JobEmpEnum.control_pre)) {
      if (a.precontrol != b.precontrol) {
        msg = "Изменен предконтролер";
        if (!a.precontrol && b.precontrol) msg = "добавлен предконтролер";
        if (a.precontrol && !b.precontrol) msg = "удален предконтролер";

        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_PRECONTROL,
          emp_ids: [b.precontrol],
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": Вы предконтролер",
          kind: PsBaseEnum.warning,
        });
        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_PRECONTROL,
          emp_ids: [a.precontrol],
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": Вы не предконтролер",
          kind: PsBaseEnum.warning,
        });
        await this.notifyOrgService.addNotify({
          notify_type_id: NotifyTypeEnum.JOB_STATUS_PRECONTROL,
          emp_ids: await this.getRelEmp({
            job_id: job_id,
            exclude: [a.precontrol, b.precontrol],
          }),
          job_id: job_id,
          message: "Поручение № " + jobEntity.num + ": " + msg,
          kind: PsBaseEnum.info,
        });
      }
    }
  }

  /**
   * ЗАПОМНИТЬ СОСТОЯНИЕ EMP-СТАТУСОВ ПОРУЧЕНИЯ
   * @param args
   * @returns
   */
  async memoNotifyJobStatus(args: {
    manager: EntityManager;
    job_id: number;
  }): Promise<INotifyOrgJob> {
    const { manager, job_id } = args;
    const ret: INotifyOrgJob = { job_id, manager };
    const jobEntity = await manager.findOneByOrFail(JobEntity, { id: job_id, del: false });

    const execJobEntity = await jobEntity.ExecJobActual;
    ret.exec = execJobEntity.map((item) => item.emp_id) ?? [];
    ret.resp = execJobEntity.filter((item) => item.is_responsible)?.at(0)?.emp_id;

    const jobControlEntity = await jobEntity.JobControlLast;
    ret.control = jobControlEntity?.controller_id;
    ret.precontrol = jobControlEntity?.prev_controller_id;

    return ret;
  }

  /**
   * НУЛЕВОЕ СОСТОЯНИЕ EMP-СТАТУСОВ ПОРУЧЕНИЯ
   * @param args
   * @returns
   */
  async memoNotifyJobStatusNull(args: {
    manager: EntityManager;
    job_id: number;
  }): Promise<INotifyOrgJob> {
    return {
      ...args,
      exec: [],
      resp: null,
      control: null,
      precontrol: null,
    } as INotifyOrgJob;
  }

  /**
   * НАЙТИ EMP_ID ВСЕХ АКТУАЛЬНЫХ УНИКАЛЬНЫХ ПРИЧАСТНЫХ К ПОРУЧЕНИЮ
   * @param(job_emp) - категории заинтересованных
   * @param(include) number[] - включить в список конкретные emp_id
   * @param(exclude) number[] - исключить из списка конкретные emp_id
   */
  async getRelEmp(args: {
    job_id: number;
    job_emp?: JobEmpEnum[];
    include?: number[];
    exclude?: number[];
  }): Promise<number[]> {
    const { job_id, job_emp = [JobEmpEnum.all], include = [], exclude = [] } = args;
    let ret: number[] = [];
    const isAll = job_emp.includes(JobEmpEnum.all);
    const jobEntity = await this.dataSource.manager.findOneByOrFail(JobEntity, { id: job_id });
    const execJobEntity = await jobEntity.Exec_job;

    // создатель
    if (isAll || job_emp.includes(JobEmpEnum.creator)) {
      ret.push(jobEntity.user_created_id);
    }

    // автор
    if (isAll || job_emp.includes(JobEmpEnum.author)) {
      ret.push(jobEntity.author_id);
    }

    // исполнители обычные
    if (isAll || job_emp.includes(JobEmpEnum.exec_simple)) {
      ret = ret.concat(
        execJobEntity
          ?.filter((item) => !item.del && !item.date_end && !item.is_responsible)
          ?.map((item) => item.emp_id) ?? [],
      );
    }

    // исполнитель ответственный
    if (isAll || job_emp.includes(JobEmpEnum.exec_respons)) {
      ret = ret.concat(
        execJobEntity
          ?.filter((item) => !item.del && !item.date_end && item.is_responsible)
          ?.map((item) => item.emp_id) ?? [],
      );
    }

    // контролер и предконтролер
    if (
      isAll ||
      job_emp.includes(JobEmpEnum.control_main) ||
      job_emp.includes(JobEmpEnum.control_pre)
    ) {
      const jobControlEntity = await jobEntity.JobControlLast;
      if (isAll || job_emp.includes(JobEmpEnum.control_main))
        ret.push(jobControlEntity?.controller_id);
      if (isAll || job_emp.includes(JobEmpEnum.control_pre))
        ret.push(jobControlEntity?.prev_controller_id);
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
