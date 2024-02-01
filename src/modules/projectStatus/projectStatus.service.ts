import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { ProjectStatusEntity } from "../../entity/#organization/project/projectStatus.entity";

@Injectable()
export class ProjectStatusService {
  private readonly projectStatusRepository: Repository<ProjectStatusEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.projectStatusRepository = dataSource.getRepository(ProjectStatusEntity);
  }

  getAllProjectStatus(): Promise<ProjectStatusEntity[]> {
    return this.projectStatusRepository.find({
      order: { nm: "ASC" },
    });
  }
}
