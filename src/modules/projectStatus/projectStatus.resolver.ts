import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { ProjectStatusEntity } from "../../entity/#organization/project/projectStatus.entity";
import { ProjectStatusService } from "./projectStatus.service";
@UseGuards(DeactivateGuard)
@Resolver(() => ProjectStatusService)
export class ProjectStatusResolver {
  constructor(private projectStatusService: ProjectStatusService) {}

  @Query(() => [ProjectStatusEntity], {
    description: "Получение списка статусов проекта",
  })
  getAllProjectStatus(): Promise<ProjectStatusEntity[]> {
    return this.projectStatusService.getAllProjectStatus();
  }
}
