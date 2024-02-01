import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";

import { UseGuards } from "@nestjs/common";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { ResponseType } from "../../common/type/errorHelper.type";
import { TypeWorkerinput, WorkerType } from "../../common/type/worker.type";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";
import { WorkerService } from "./worker.service";
@UseGuards(DeactivateGuard)
@Resolver()
export class WorkerResolver {
  constructor(public workerServ: WorkerService) {}

  @Query(() => [WorkerType], { description: "Получить всех сотрудников" })
  async getAllWorker(): Promise<WorkerType> {
    return await this.workerServ.getAllWorker();
  }

  @Mutation(() => StaffEntity, { description: "Cоздание сотрудника" })
  async createWorker(
    @Args("args") args: TypeWorkerinput,
    @Context() context,
  ): Promise<StaffEntity> {
    return await this.workerServ.createWorker(args);
  }

  @Mutation(() => ResponseType, { description: "Удаления сотрудника" })
  async deleteWorker(@Args("id") id: number, @Context() context): Promise<ResponseType> {
    return await this.workerServ.deleteWorker(id);
  }
}
