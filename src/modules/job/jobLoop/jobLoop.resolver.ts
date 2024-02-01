import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { ActionsJob } from "../../../BACK_SYNC_FRONT/actions/actions.job";
import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { JobLoopEntity } from "../../../entity/#organization/job/jobLoop.entity";
import { Access } from "../../access/guard/access.guard";
import { GetMonthVariantsResponse, JobLoopParamDtoSet } from "./jobLoop.dto";
import { JobLoopService } from "./jobLoop.service";
import { getJobLoopMonthVariantsUtil } from "./jobLoop.utils";

@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver()
export class JobLoopResolver {
  constructor(private jobLoopService: JobLoopService) {}

  /**
   * Периодичные поручения: создать серию подпоручений
   */
  @Mutation(() => [JobEntity], { description: "Периодичные поручения: создать серию подпоручений" })
  @Access(ActionsJob.JOB_SET_LOOP)
  @UseGuards(DeactivateGuard, PoliceGuard)
  async createJobLoop(
    @Token()
    token: IToken,
    @Args("job_id", { description: "id поручения", type: () => Int })
    job_id: number,
  ): Promise<JobEntity[]> {
    return this.jobLoopService.createJobLoop({
      emp_id: token.current_emp_id,
      job_id: job_id,
    });
  }

  /**
   * Периодичные поручения: установить параметры
   */
  @Mutation(() => JobLoopEntity, { description: "Периодичные поручения: установить параметры" })
  @Access(ActionsJob.JOB_SET_LOOP_PARAM)
  async setJobLoopParam(
    @Args("job_id", { description: "id главного поручения", type: () => Int })
    job_id: number,

    @Args()
    param: JobLoopParamDtoSet,
  ): Promise<JobLoopEntity> {
    return this.jobLoopService.setJobLoopParam(job_id, param);
  }

  /**
   * Периодичные поручения: прочитать параметры
   */
  @Query(() => JobLoopEntity, { description: "Периодичные поручения: прочитать параметры" })
  async getJobLoopParam(
    @Args("job_id", { description: "id главного поручения", type: () => Int })
    job_id: number,
  ): Promise<JobLoopEntity> {
    return this.jobLoopService.getJobLoopParam(job_id);
  }

  /**
   * Получить список вариантов выбора для заданной даты
   */
  @Query(() => [GetMonthVariantsResponse], {
    description: "Получить варианты выбора для заданной даты",
  })
  async getJobLoopMonthVariants(
    @Args("start_date", { description: "Начало повторов: дата", type: () => Date })
    start_date: Date,
  ): Promise<GetMonthVariantsResponse[]> {
    return await getJobLoopMonthVariantsUtil(start_date);
  }
}
