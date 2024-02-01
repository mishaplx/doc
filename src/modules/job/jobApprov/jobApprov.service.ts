import { HttpException, Inject, Injectable } from "@nestjs/common";

import { PsBaseEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";
import { customError, httpExceptErr } from "src/common/type/errorHelper.type";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { ForwardingEntity } from "src/entity/#organization/forwarding/forwarding.entity";
import { JobEntity } from "src/entity/#organization/job/job.entity";
import { JobApproveEntity } from "src/entity/#organization/job/jobApprove.entity";
import { NotifyTypeEnum } from "src/modules/notify/notify.const";
import {
  JobEmpEnum,
  NotifyOrgJobService,
  addNotifyJobAnyNum,
} from "src/modules/notify/org/notifyOrgJob.service";
import { IsNull } from "typeorm";
import { JobLoopService } from "../jobLoop/jobLoop.service";
import { JobsService } from "../job.service";
import { job2doc } from "../utils/job.utils";
import { JobStatus } from "src/BACK_SYNC_FRONT/enum/enum.job";

const ERR = "Поручение: ошибка ";

@Injectable()
export class JobApprovService {
  @Inject(JobsService) private readonly jobsService: JobsService;
  constructor(
    // @Inject(PubSubService) private readonly pubSubService: PubSubService,
    @Inject(NotifyOrgJobService) private readonly notifyOrgJobService: NotifyOrgJobService,
    @Inject(JobLoopService) private readonly jobLoopService: JobLoopService,
  ) {}

  /**
   * Поручение: отправить на утверждение
   */
  async sendForApprove(emp_id: number, job_id: number): Promise<JobApproveEntity | HttpException> {
    try {
      const ret = await this.jobsService.dataSource.transaction(async (manager) => {
        const empEntity = await manager.findOneBy(EmpEntity, {
          id: emp_id,
          del: false,
          temp: false,
        });
        if (!empEntity) customError("Не найден пользователь");

        // изменить статус поручения
        await manager.update(JobEntity, job_id, {
          status_id: JobStatus.ON_APPROVAL,
        });

        // создать JobApproveEntity (сразу save нельзя из-за связей)
        const jobApproveEntity = await manager.create(JobApproveEntity, {
          job_id: job_id,
          emp_id_request: emp_id,
          date_request: new Date(),
        });
        return await manager.save(JobApproveEntity, jobApproveEntity);
      });

      // уведомление автору
      await this.notifyOrgJobService.addNotifyJobAny({
        job_id: job_id,
        job_emp: [JobEmpEnum.author],
        notify_type_id: NotifyTypeEnum.JOB_REQUEST_APPROV,
        message: "Поручение № " + addNotifyJobAnyNum + ": запрос на утверждение",
        kind: PsBaseEnum.warning,
      });

      return ret;
    } catch (err) {
      return httpExceptErr(err);
    }
  }

  /**
   * Поручение: утвердить
   */
  async askForApprove(
    emp_id: number,
    job_id: number,
    note?: string,
  ): Promise<JobApproveEntity | HttpException> {
    try {
      const ret = await this.jobsService.dataSource.transaction(async (manager) => {
        const jobApprovList = await manager.find(JobApproveEntity, {
          where: { job_id: job_id, emp_id_resolv: IsNull() },
          order: { date_request: "ASC" },
        });
        if (!jobApprovList || jobApprovList.length == 0)
          customError("Не найден запрос на утверждение");

        // обновить JobApproveEntity
        let jobApprov: JobApproveEntity;
        for (const item of jobApprovList) {
          jobApprov = item;
          await manager.update(JobApproveEntity, item.id, {
            emp_id_resolv: emp_id,
            approved: true,
            note_resolv: note,
            date_resolv: new Date(),
          });
        }

        // изменить статус поручения
        await manager.update(JobEntity, job_id, {
          status_id: JobStatus.APPROVED,
        });

        // создать периодические поручения
        const jobEntity = await manager.findOneOrFail(JobEntity, {
          relations: { JobLoop: true },
          where: { id: job_id },
        });
        if (await jobEntity.JobLoop) {
          await this.jobLoopService.createJobLoopManager({
            manager: manager,
            emp_id: emp_id,
            job_id: job_id,
          });
        }

        return jobApprov;
      });

      // список заказавших уведомление при передаче / пересылке
      let empList: number[] = [];
      const { doc_id } = await this.jobsService.dataSource.manager.findOneByOrFail(JobEntity, {
        id: job_id,
      });
      if (doc_id) {
        empList = (
          await this.jobsService.dataSource.manager.findBy(ForwardingEntity, { id_doc: doc_id })
        )
          .filter((item) => item.is_notify_emp_creator)
          .map((item) => item.emp_creator);
      }

      // уведомление создателю и заказавшим эту опцию при передаче / пересылке
      await this.notifyOrgJobService.addNotifyJobAny({
        job_id: job_id,
        job_emp: [JobEmpEnum.creator],
        include: empList,
        notify_type_id: NotifyTypeEnum.JOB_RESOLV_APPROV,
        message: "Поручение № " + addNotifyJobAnyNum + ": утверждено",
        kind: PsBaseEnum.success,
      });

      return ret;
    } catch (err) {
      customError(ERR + "утверждения", err);
    }
  }

  /**
   * Поручение: отправить на доработку
   * не путать с: контроль вернуть
   */
  async reworkForApprove(
    emp_id: number,
    job_id: number,
    note?: string,
  ): Promise<JobApproveEntity | HttpException> {
    try {
      const ret = await this.jobsService.dataSource.transaction(async (manager) => {
        const jobApprovList = await manager.find(JobApproveEntity, {
          where: { job_id: job_id, emp_id_resolv: IsNull() },
          order: { date_request: "ASC" },
        });
        if (!jobApprovList || jobApprovList.length == 0)
          customError("Не найден запрос на утверждение");

        // обновить JobApproveEntity
        let jobApprov: JobApproveEntity;
        for (const item of jobApprovList) {
          jobApprov = item;
          await manager.update(JobApproveEntity, item.id, {
            emp_id_resolv: emp_id,
            approved: false,
            note_resolv: note,
            date_resolv: new Date(),
          });
        }

        // изменить статус поручения
        await manager.update(JobEntity, job_id, {
          status_id: JobStatus.ON_REWORK,
        });

        return jobApprov;
      });

      // уведомление создателю
      await this.notifyOrgJobService.addNotifyJobAny({
        job_id: job_id,
        job_emp: [JobEmpEnum.creator],
        notify_type_id: NotifyTypeEnum.JOB_RESOLV_REWORK,
        message: "Поручение № " + addNotifyJobAnyNum + ": отправлено на доработку",
        kind: PsBaseEnum.error,
      });

      return ret;
    } catch (err) {
      return httpExceptErr(err);
    }
  }
}
