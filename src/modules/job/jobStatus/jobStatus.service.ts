import { Inject, Injectable } from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { JobStatusesEntity } from "../../../entity/#organization/job/jobStatus.entity";

@Injectable()
export class JobStatusService {
  private readonly jobStatusRepository: Repository<JobStatusesEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.jobStatusRepository = dataSource.getRepository(JobStatusesEntity);
  }

  getAllJobStatus(): Promise<JobStatusesEntity[]> {
    return this.jobStatusRepository.find({
      order: { nm: "ASC" },
    });
  }
}
