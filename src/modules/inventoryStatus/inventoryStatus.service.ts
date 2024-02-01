import { Inject, Injectable } from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { InventoryStatusEntity } from "../../entity/#organization/inventoryStatus/inventoryStatus.entity";

@Injectable()
export class InventoryStatusService {
  private readonly inventoryStatusRepository: Repository<InventoryStatusEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.inventoryStatusRepository = dataSource.getRepository(InventoryStatusEntity);
  }

  findAll(): Promise<InventoryStatusEntity[]> {
    return this.inventoryStatusRepository.find({
      where: { del: false },
      order: { nm: "ASC" },
    });
  }
}
