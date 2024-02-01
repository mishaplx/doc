import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { HttpException, UseGuards } from "@nestjs/common";
import { ActionsJob } from "../../../BACK_SYNC_FRONT/actions/actions.job";
import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { JobControlEntity } from "../../../entity/#organization/job/jobControl.entity";
import { PaginationInput, defaultPaginationValues } from "../../../pagination/paginationDTO";
import { Access } from "../../access/guard/access.guard";
import { CreateJobControlInput } from "./dto/create-jobcontrol.input";
import { DeleteJobControlInput } from "./dto/delete-jobcontrol.input";
import { GetJobControlArgs } from "./dto/get-jobcontrol.args";
import { GetOutOfControlInput } from "./dto/get-out-of-control.input";
import { PaginatedJobControlResponse } from "./dto/paginated-jobcontrol-response.dto";
import { ProlongTheJobInput } from "./dto/prolong-the-job.input";
import { RefusalToRenewInput } from "./dto/refusal-to-renew.input";
import { ReturnToExecJobControlInput } from "./dto/return-to-exec-jobcontrol.input";
import { UpdateJobControlInput } from "./dto/update-jobcontrol.input";
import { JobControlService } from "./jobControl.service";

@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => JobControlEntity)
export class JobControlResolver {
  constructor(private readonly jobControlService: JobControlService) {}

  /**
   * КОНТРОЛЬ: СОЗДАТЬ
   */
  @Mutation(() => JobControlEntity, {
    description: "Добавление данных по контролю поручения",
  })
  createJobControl(
    @Args("createJobControlInput") createJobControlInput: CreateJobControlInput,
  ): Promise<JobControlEntity | HttpException> {
    return this.jobControlService.create({ createJobControlInput: createJobControlInput });
  }

  @Query(() => PaginatedJobControlResponse, {
    description: "Получение контроля поручения",
  })
  jobControls(
    @Args() args: GetJobControlArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
  ): Promise<PaginatedJobControlResponse> {
    return this.jobControlService.findAll(args, pagination);
  }

  @Query(() => JobControlEntity, {
    nullable: true,
    description: "Получение записи контроля поручения",
  })
  jobControl(@Args("id", { type: () => Int }) id: number): Promise<JobControlEntity> {
    return this.jobControlService.findOne(id);
  }

  /**
   * КОНТРОЛЬ: ИЗМЕНИТЬ
   */
  @Mutation(() => JobControlEntity, {
    description: "Редактирование данных по контролю поручения",
  })
  // @Access(ActionsJob.JOB_CONTROL_EDIT) FIXME: id -> job_id
  updateJobControl(
    @Args("updateJobControlInput") updateJobControlInput: UpdateJobControlInput,
  ): Promise<JobControlEntity> {
    return this.jobControlService.update(updateJobControlInput.id, updateJobControlInput);
  }

  @Mutation(() => Boolean, {
    description: "Удаление данных по контролю поручения",
  })
  @Access(ActionsJob.JOB_CONTROL_DEL)
  deleteJobControl(
    @Args("deleteJobControlInput") deleteJobControlInput: DeleteJobControlInput,
  ): Promise<boolean> {
    return this.jobControlService.delete(deleteJobControlInput.jobId);
  }

  /**
   * КОНТРОЛЬ: СНЯТЬ С КОНТРОЛЯ
   */
  @Mutation(() => Boolean, { description: "Снять с контроля" })
  @Access(ActionsJob.JOB_CONTROL_CANCEL)
  getOutOfControl(
    @Args("getOutOfControlInput") getOutOfControlInput: GetOutOfControlInput,
  ): Promise<boolean | HttpException> {
    return this.jobControlService.getOutOfControl({
      job_id: getOutOfControlInput.jobId,
    });
  }

  @Mutation(() => Boolean, { description: "Вернуть исполнителю" })
  @Access(ActionsJob.JOB_CONTROL_REWORK)
  returnToExecJobControl(
    @Args("returnToExecJobControlInput")
    returnToExecJobControlInput: ReturnToExecJobControlInput,
  ): Promise<boolean> {
    return this.jobControlService.returnToExec(returnToExecJobControlInput);
  }

  /**
   * КОНТРОЛЬ: ПРОДЛИТЬ СРОК
   */
  @Mutation(() => Boolean, { description: "Продлить срок поручения" })
  @Access(ActionsJob.JOB_CONTROL_TERM_APPROV)
  prolongTheJob(
    @Args("prolongTheJobInput") prolongTheJobInput: ProlongTheJobInput,
  ): Promise<boolean> {
    return this.jobControlService.prolongTheJob(prolongTheJobInput);
  }

  /**
   * КОНТРОЛЬ: ОТКАЗАТЬ В ПРОДЛЕНИИ СРОКА
   */
  @Mutation(() => Boolean, { description: "Отказать в продлении срока поручения" })
  @Access(ActionsJob.JOB_CONTROL_TERM_REFUSE)
  refusalToRenew(
    @Args("refusalToRenewInput") refusalToRenewInput: RefusalToRenewInput,
  ): Promise<boolean> {
    return this.jobControlService.refusalToRenew(refusalToRenewInput.jobId);
  }

  /**
   * КОНТРОЛЬ: УСТАНОВТЬ ПРЕДКОНТРОЛЬ
   */
  @Mutation(() => JobControlEntity, { description: "Предконтроль" })
  @Access(ActionsJob.JOB_CONTROL_BEFORE)
  async setForControlBefore(
    @Token()
    token: IToken,

    @Args("job_id", { description: "id поручения", type: () => Int })
    job_id: number,

    @Args("note", {
      nullable: true,
      defaultValue: "",
      description: "пояснение",
    })
    note: string,
  ): Promise<JobControlEntity | HttpException> {
    return this.jobControlService.setForControlBefore({
      emp_id: token.current_emp_id,
      job_id: job_id,
      note: note,
    });
  }
}
