import { Inject, Injectable, Scope } from "@nestjs/common";
import "dotenv/config";
import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { SmdoDocTypesEntity } from "../../entity/#organization/smdo/smdo_doc_types.entity";
import { wLogger } from "../../modules/logger/logging.module";

@Injectable()
export class DockTypesService {
  private readonly docTypesRepository: Repository<SmdoDocTypesEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.docTypesRepository = dataSource.getRepository(SmdoDocTypesEntity);
  }

  async get(): Promise<SmdoDocTypesEntity[]> {
    try {
      return await this.docTypesRepository.find();
    } catch (e) {
      wLogger.error(e);
    }
  }
}
