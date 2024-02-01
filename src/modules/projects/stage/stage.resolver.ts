import { HttpException, Injectable, Res, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { ExecInprojectRouteEntity } from "../../../entity/#organization/project/execInprojectRoute.entity";
import { AddExectDto, UpdateExecProjectDto } from "../dto/stage/addExec.dto";
import { StageService } from "./stage.service";

@Injectable()
@UseGuards(DeactivateGuard)
@Resolver()
export class StageResolver {
  constructor(private stageService: StageService) {}
  @UseGuards(PoliceGuard)
  @Mutation(() => [ExecInprojectRouteEntity])
  async addExecInStageProject(
    @Args("AddExectDto", {
      description: "данные по исполнителю на этап",
    })
    AddExectDto: AddExectDto,
    @Res() res,
    @Token() token: IToken,
  ): Promise<ExecInprojectRouteEntity[] | HttpException> {
    return await this.stageService.addExecInStageProject(AddExectDto, res, token);
  }

  @Mutation(() => ExecInprojectRouteEntity, {
    description: "обновление исполнителя",
  })
  async updateExecInStageProject(
    @Args("updateExectDto", {
      description: "данные по исполнителю на этап",
    })
    updateExectDto: UpdateExecProjectDto,
    @Token() token: IToken,
  ): Promise<ExecInprojectRouteEntity | HttpException> {
    return await this.stageService.updateExecInStageProject(updateExectDto, token);
  }

  @Query(() => [ExecInprojectRouteEntity], {
    description: "получение всех исполнителей по данному этапу проекта",
  })
  async getAllExecInStageProject(
    @Args("project_id", {
      description: "project_id",
    })
    project_id: number,
    @Args("stage_id", {
      description: "stage_id",
    })
    stage_id: number,
  ): Promise<ExecInprojectRouteEntity[] | HttpException> {
    return await this.stageService.getAllExecInStageProject(project_id, stage_id);
  }

  @Query(() => ExecInprojectRouteEntity, {
    description: "получение всех исполнителей по данному этапу проекта",
  })
  async getExecInStageProjectByID(
    @Args("executor_id", {
      description: "executor_id",
    })
    executor_id: number,
  ): Promise<ExecInprojectRouteEntity | HttpException> {
    return await this.stageService.getExecInStageProjectByID(executor_id);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean)
  async deleteExecInStageProject(
    @Args("project_id", {
      description: "project_id",
    })
    project_id: number,
    @Args("exec_id", {
      description: "exec_id",
    })
    exec_id: number,
    @Token() token: IToken,
  ): Promise<HttpException | boolean> {
    return await this.stageService.deleteExecInStageProject(project_id, exec_id, token);
  }
}
