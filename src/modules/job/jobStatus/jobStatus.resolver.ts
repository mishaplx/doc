import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { JobStatusesEntity } from "../../../entity/#organization/job/jobStatus.entity";
import { JobStatusService } from "./jobStatus.service";

@UseGuards(DeactivateGuard)
@Resolver(() => JobStatusesEntity)
export class JobStatusResolver {
  constructor(private jobStatusService: JobStatusService) {}

  @Query(() => [JobStatusesEntity], {
    description: "Получение списка статусов поручения",
  })
  getAllJobStatus(): Promise<JobStatusesEntity[]> {
    return this.jobStatusService.getAllJobStatus();
  }
}
