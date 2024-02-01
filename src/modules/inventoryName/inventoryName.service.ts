import { Inject, Injectable } from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { InventoryNameEntity } from "../../entity/#organization/inventoryName/inventoryName.entity";

@Injectable()
export class InventoryNameService {
  private readonly inventoryNameRepository: Repository<InventoryNameEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.inventoryNameRepository = dataSource.getRepository(InventoryNameEntity);
  }

  findAll(): Promise<InventoryNameEntity[]> {
    return this.inventoryNameRepository.find({
      where: { del: false },
      order: { nm: "ASC" },
    });
  }
}
