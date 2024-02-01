import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";

import { ActionsJob } from "../../../BACK_SYNC_FRONT/actions/actions.job";
import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { JobApproveEntity } from "../../../entity/#organization/job/jobApprove.entity";
import { Access } from "../../access/guard/access.guard";
import { JobApprovService } from "./jobApprov.service";

@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver()
export class JobApprovResolver {
  constructor(private jobApprovService: JobApprovService) {}

  /**
   * Поручение: отправить на утверждение
   * @param job_id
   */
  @Mutation(() => JobApproveEntity, { description: "Отправить на утверждение" })
  @Access(ActionsJob.JOB_SEND_APPROV)
  async sendForApprove(
    @Token() token: IToken,
    @Args("job_id", { description: "id поручения", type: () => Int })
    job_id: number,
  ): Promise<JobApproveEntity | HttpException> {
    return this.jobApprovService.sendForApprove(token.current_emp_id, job_id);
  }

  /**
   * Поручение: утвердить
   */
  @Mutation(() => JobApproveEntity, { description: "Утверждение поручения" })
  @Access(ActionsJob.JOB_SET_APPROV)
  async askForApprove(
    @Token() token: IToken,
    @Args("job_id", { description: "id поручения", type: () => Int })
    job_id: number,
    @Args("note", {
      nullable: true,
      defaultValue: "",
      description: "пояснение",
    })
    note?: string,
  ): Promise<JobApproveEntity | HttpException> {
    return this.jobApprovService.askForApprove(token.current_emp_id, job_id, note.trim());
  }

  /**
   * Поручение: отправить на доработку
   * не путать с: контроль вернуть
   */
  @Mutation(() => JobApproveEntity, {
    description: "Отправить на доработку (не путать с: контроль вернуть)",
  })
  @Access(ActionsJob.JOB_SEND_REWORK)
  async reworkForApprove(
    @Token() token: IToken,
    @Args("job_id", { description: "id поручения", type: () => Int })
    job_id: number,
    @Args("note", {
      nullable: true,
      defaultValue: "",
      description: "пояснение",
    })
    note?: string,
  ): Promise<JobApproveEntity | HttpException> {
    return this.jobApprovService.reworkForApprove(token.current_emp_id, job_id, note.trim());
  }
}
