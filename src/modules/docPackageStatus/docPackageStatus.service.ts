import { Inject, Injectable } from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocPackageStatusEntity } from "../../entity/#organization/docPackageStatus/docPackageStatus.entity";

@Injectable()
export class DocPackageStatusService {
  private readonly docPackageStatusRepository: Repository<DocPackageStatusEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.docPackageStatusRepository = dataSource.getRepository(DocPackageStatusEntity);
  }

  findAll(): Promise<DocPackageStatusEntity[]> {
    return this.docPackageStatusRepository.find({
      where: { del: false },
      order: { nm: "ASC" },
    });
  }
}
