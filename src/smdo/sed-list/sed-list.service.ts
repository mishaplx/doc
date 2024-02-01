import { Inject, Injectable, Scope } from "@nestjs/common";
import "dotenv/config";
import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { SmdoSedListEntity } from "../../entity/#organization/smdo/smdo_sed_list.entity";
import { wLogger } from "../../modules/logger/logging.module";

@Injectable()
export class SedListService {
  private readonly sedListRepository: Repository<SmdoSedListEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.sedListRepository = dataSource.getRepository(SmdoSedListEntity);
  }

  async get(): Promise<SmdoSedListEntity[]> {
    try {
      return await this.sedListRepository.find();
    } catch (e) {
      wLogger.error(e);
    }
  }
}
