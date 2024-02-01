import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { ActStatusEntity } from "../../entity/#organization/actStatus/actStatus.entity";
import { DocPackageStatusEntity } from "../../entity/#organization/docPackageStatus/docPackageStatus.entity";

@Injectable()
export class ActStatusService {
  private readonly actStatusRepository: Repository<ActStatusEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.actStatusRepository = dataSource.getRepository(ActStatusEntity);
  }

  findAll(): Promise<DocPackageStatusEntity[]> {
    return this.actStatusRepository.find({
      where: { del: false },
      order: { nm: "ASC" },
    });
  }
}
