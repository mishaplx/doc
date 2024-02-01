import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";

import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { ExecJobEntity } from "../../../entity/#organization/job/jobExec.entity";
import { CreateExecDto } from "../dto/createExec.dto";
import { DeleteExecDto } from "../dto/deleteExec.dto";
import { UpdateExecDto } from "../dto/updateExec.dto";
import { JobExecutorService } from "./jobExecutor.service";

@UseGuards(DeactivateGuard)
@Resolver()
export class JobExecutorResolver {
  constructor(private jobExecutorService: JobExecutorService) {}

  /**
   * Поручение: добавить исполнителей
   */
  @Mutation(() => [ExecJobEntity], {
    description: "Поручение: добавить исполнителей",
  })
  async addExecutor(
    @Token() token: IToken,
    @Args("execJobList", {
      description: "исполнители",
      type: () => [CreateExecDto],
    })
    execJobList: [CreateExecDto],
  ): Promise<ExecJobEntity[] | HttpException> {
    return this.jobExecutorService.addExecutor({
      emp_id: token.current_emp_id,
      execJobList: execJobList,
    });
  }

  /**
   * Поручение: удалить исполнителя
   */
  @Mutation(() => JobEntity, {
    description: "Поручение: удалить исполнителя",
  })
  // FIXME: сделать аргументы { job_id: ..., exec_job_id: ...}
  // @Access(ActionsJob.JOB_EXECUTOR_DEL)
  async deleteExecutor(
    @Token() token: IToken,
    @Args("execJob", {
      description: "исполнитель",
      type: () => DeleteExecDto,
    })
    execJob: DeleteExecDto,
  ): Promise<ExecJobEntity | HttpException> {
    return this.jobExecutorService.deleteExecutor(token.current_emp_id, execJob);
  }

  /**
   * Поручение: обновить данные по исполнителю
   */
  @Mutation(() => ExecJobEntity, {
    description: "Поручение: обновить данные по исполнителю",
  })
  async updateExecutor(
    @Token() token: IToken,
    @Args("execJob", {
      description: "что нужно обновить по исполнителю",
      type: () => UpdateExecDto,
    })
    execJob: UpdateExecDto,
  ): Promise<ExecJobEntity | HttpException> {
    return this.jobExecutorService.updateExecutor({
      emp_id: token.current_emp_id,
      execJob: execJob,
    });
  }
}
