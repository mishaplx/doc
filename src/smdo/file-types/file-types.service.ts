import { Inject, Injectable, Scope } from "@nestjs/common";
import "dotenv/config";
import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { SmdoFileTypesEntity } from "../../entity/#organization/smdo/smdo_file_types.entity";
import { wLogger } from "../../modules/logger/logging.module";

@Injectable()
export class FileTypesService {
  private readonly fileTypesRepository: Repository<SmdoFileTypesEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.fileTypesRepository = dataSource.getRepository(SmdoFileTypesEntity);
  }

  async get(): Promise<SmdoFileTypesEntity[]> {
    try {
      return await this.fileTypesRepository.find();
    } catch (e) {
      wLogger.error(e);
    }
  }
}
