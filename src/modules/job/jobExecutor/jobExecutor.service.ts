import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { EntityManager } from "typeorm";

import { ActionsJob } from "../../../BACK_SYNC_FRONT/actions/actions.job";
import { customError, httpExceptErr, setErrorGQL } from "../../../common/type/errorHelper.type";
import { HistoryResponsibleEntity } from "../../../entity/#organization/history_responsible/history_responsible.entity";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { ExecJobEntity } from "../../../entity/#organization/job/jobExec.entity";
import { toEntityExecJob } from "../../access/utils/utils.job";
import { NotifyOrgService } from "../../notify/org/notifyOrg.service";
import { JobEmpEnum, NotifyOrgJobService } from "../../notify/org/notifyOrgJob.service";
import { CreateExecDto } from "../dto/createExec.dto";
import { DeleteExecDto } from "../dto/deleteExec.dto";
import { UpdateExecDto } from "../dto/updateExec.dto";
import { JobsService } from "../job.service";

@Injectable()
export class JobExecutorService {
  @Inject(JobsService)
  private readonly jobsService: JobsService;

  constructor(
    @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
    @Inject(NotifyOrgJobService) private readonly notifyOrgJobService: NotifyOrgJobService,
  ) {}

  /**
   * Поручение: добавить исполнителей
   */
  async addExecutor(args: {
    manager?: EntityManager;
    emp_id: number;
    execJobList: CreateExecDto[];
    responsible_emp_id?: number;
    is_valid?: boolean;
  }): Promise<ExecJobEntity[] | HttpException> {
    const { manager, ...argOther } = args;
    return manager
      ? await this.addExecutorManager({
          manager,
          ...argOther,
        })
      : await this.jobsService.dataSource.transaction(
          async (manager) =>
            await this.addExecutorManager({
              manager,
              ...argOther,
            }),
        );
  }

  async addExecutorManager(args: {
    manager: EntityManager;
    emp_id: number;
    execJobList: CreateExecDto[];
    responsible_emp_id?: number;
    is_valid?: boolean;
  }): Promise<ExecJobEntity[] | HttpException> {
    try {
      const {
        manager,
        emp_id: current_emp_id,
        execJobList,
        responsible_emp_id,
        is_valid = true,
      } = args;
      const job_id = execJobList?.at(0)?.job_id ?? 0;

      // доступность операции
      // ТОDO: перенести в resolver, is_valid - убрать
      if (is_valid) {
        await this.jobsService.accessJob.valid({
          emp_id: current_emp_id,
          actions: [ActionsJob.JOB_EXECUTOR_ADD],
          args_parsed: {
            job: [job_id],
          },
          args_origin: execJobList,
        });
      }

      // запомнить emp-статусы по поручению
      const notify = await this.notifyOrgJobService.memoNotifyJobStatus({
        job_id: job_id,
        manager: manager,
      });

      // текущее поручение
      const jobEntity = await manager.findOneBy(JobEntity, {
        id: job_id,
        del: false,
      });

      // старые исполнители
      const execJobEntityOldList = await jobEntity.ExecJobActual;

      // добавить исполнителей
      let execJobEntityList: ExecJobEntity[] = await manager.create(
        ExecJobEntity,
        execJobList as ExecJobEntity[],
      );
      execJobEntityList = await manager.save(ExecJobEntity, execJobEntityList);

      // установить ответственного исполнителя
      let exec_job_responsible_id_new: number;
      // по требованию
      if (responsible_emp_id) {
        exec_job_responsible_id_new = execJobEntityList
          .filter((x) => x.emp_id == responsible_emp_id)
          ?.at(0)?.id;
        // по умолчанию
      } else {
        // - не указан responsible_emp_id
        // - нет ответственного исполнителя и
        // - нет ранее добавленных исполнителей и
        // - добавляется один исполнитель
        // ответственный исполнитель старый
        const hrEntityOld = await jobEntity.HistoryResponsibleActual;
        if (!hrEntityOld && execJobEntityOldList.length == 0 && execJobList.length == 1) {
          exec_job_responsible_id_new = execJobEntityList.at(0).id;
        }
      }

      if (exec_job_responsible_id_new) {
        execJobEntityList = [
          (await this.updateExecutorManager({
            manager: manager,
            emp_id: current_emp_id,
            execJob: {
              id: exec_job_responsible_id_new,
              is_responsible: true,
            },
          })) as ExecJobEntity,
        ];
      }

      // уведомления об изменении статусов
      await this.notifyOrgJobService.addNotifyJobStatus({
        memo: notify,
        job_emp: [JobEmpEnum.exec_all],
      });

      return execJobEntityList;
    } catch (err) {
      return setErrorGQL("Ошибка добавления исполнителя(ей) ", err);
    }
  }

  /**
   * Поручение: удалить исполнителя
   */
  async deleteExecutor(
    emp_id: number,
    execJob: DeleteExecDto,
  ): Promise<ExecJobEntity | HttpException> {
    try {
      // исполнитель поручения
      const execJobEntity = await toEntityExecJob({
        dataSource: this.jobsService.dataSource,
        val: execJob.id,
        need_exist: true,
        need_actual: true,
      });

      // найти поручение
      const jobEntity = await execJobEntity.Job;

      // запомнить emp-статусы по поручению
      const notify = await this.notifyOrgJobService.memoNotifyJobStatus({
        job_id: jobEntity.id,
        manager: this.jobsService.dataSource.manager,
      });

      const ret = await this.jobsService.dataSource.transaction(async (manager) => {
        // доступность операции
        await this.jobsService.accessJob.valid({
          emp_id: emp_id,
          actions: [ActionsJob.JOB_EXECUTOR_DEL],
          args_parsed: {
            job: [jobEntity],
            exec_job: [execJob.id],
          },
        });

        // убрать с исполнителя флаг: ответственный
        if (execJobEntity.is_responsible) {
          const dto = new UpdateExecDto();
          dto.id = execJob.id;
          dto.is_responsible = false;
          const ret = await this.updateExecutorManager({
            manager: manager,
            emp_id: emp_id,
            execJob: dto,
          });
          if (isInstance(ret, HttpException))
            customError("Ошибка удаления флага: ответственный исполнитель");
        }

        // ExecJob: пометить запись как удаленную
        await manager.update(ExecJobEntity, execJobEntity.id, {
          del: true,
          date_end: new Date(),
        });
        // await manager.delete(ExecJobEntity, { id: execJob.id });

        // вернуть обновленную удаленную запись
        return await manager.findOneBy(ExecJobEntity, {
          id: execJob.id,
        });
      });

      // уведомления об изменении статусов
      await this.notifyOrgJobService.addNotifyJobStatus({
        memo: notify,
        job_emp: [JobEmpEnum.exec_all],
      });

      return ret;
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  /**
   * Поручение: обновить данные по исполнителю
   */
  async updateExecutor(args: {
    manager?: EntityManager;
    emp_id: number;
    execJob: UpdateExecDto;
  }): Promise<ExecJobEntity | HttpException> {
    const { manager, ...argOther } = args;
    return manager
      ? await this.updateExecutorManager({
          manager,
          ...argOther,
        })
      : await this.jobsService.dataSource.transaction(
          async (manager) =>
            await this.updateExecutorManager({
              manager,
              ...argOther,
            }),
        );
  }

  async updateExecutorManager(args: {
    manager: EntityManager;
    emp_id: number;
    execJob: UpdateExecDto;
  }): Promise<ExecJobEntity | HttpException> {
    try {
      const { emp_id, manager, execJob } = args;
      const execJobEntity = await manager.findOne(ExecJobEntity, {
        relations: {
          Job: {
            Exec_job: true,
            HistoryResponsible: true,
          },
          Controller: true,
        },
        where: {
          id: execJob.id,
          del: false,
        },
      });
      if (!execJobEntity) customError("Не найден исполнитель поручения");

      const empEntity = await execJobEntity.Controller;

      const jobEntity = await execJobEntity.Job;

      // доступность операции
      await this.jobsService.accessJob.valid({
        emp_id: emp_id,
        actions: [ActionsJob.JOB_EXECUTOR_UPDATE],
        args_parsed: {
          job: [jobEntity],
        },
      });

      // запомнить emp-статусы по поручению
      const notify = await this.notifyOrgJobService.memoNotifyJobStatus({
        job_id: jobEntity.id,
        manager: manager,
      });

      const historyResponsibleEntityList = await jobEntity.HistoryResponsible;
      const execJobList = await jobEntity.Exec_job;

      // изменен флаг: ответственный исполнитель
      if (
        execJob.is_responsible !== undefined &&
        execJob.is_responsible !== execJobEntity.is_responsible
      ) {
        // History: проставить дату завершения на всех + создать запись при установке ответственного
        for (const item of historyResponsibleEntityList) {
          if (!item.date_end) {
            await manager.update(HistoryResponsibleEntity, item.id, {
              date_end: new Date(),
            });
          }
        }

        if (execJob.is_responsible) {
          const newHistoryResponsibleEntity = await manager.create(HistoryResponsibleEntity, {
            emp_id: empEntity.id,
            job_id: jobEntity.id,
            date_start: new Date(),
          });
          await manager.save(HistoryResponsibleEntity, newHistoryResponsibleEntity);
        }

        // ExecJob: флаг ответственного установить - для обновляемого, для остальных - сбросить
        for (const item of execJobList) {
          if (!item.date_end) {
            await manager.update(ExecJobEntity, item.id, {
              is_responsible: item.id === execJob.id ? execJob.is_responsible : false,
            });
          }
        }
      }

      // ExecJob: обновить остальные поля
      let updateObj = {};
      if (
        execJob.date_assign &&
        execJob.date_assign.getTime() != execJobEntity.date_assign.getTime()
      )
        updateObj = { date_assign: execJob.date_assign };
      if (execJob.note && execJob.note != execJobEntity.note)
        updateObj = { ...updateObj, note: execJob.note };
      if (Object.keys(updateObj).length > 0) {
        await manager.update(ExecJobEntity, execJob.id, updateObj);
      }

      // уведомления об изменении статусов
      await this.notifyOrgJobService.addNotifyJobStatus({
        memo: notify,
        job_emp: [JobEmpEnum.exec_all],
      });

      return await manager.findOneBy(ExecJobEntity, {
        id: execJobEntity.id,
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  }
}
