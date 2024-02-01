import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DeliveryEntity } from "../../entity/#organization/delivery/delivery.entity";

// Оригинал/Копия
@Injectable()
export class TypeSendService {
  private readonly deliveryRepository: Repository<DeliveryEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.deliveryRepository = dataSource.getRepository(DeliveryEntity);
  }
  async getAllTypeSender(): Promise<DeliveryEntity[]> {
    const result = this.deliveryRepository.find({
      order: {
        nm: "ASC",
      },
    });
    return result;
  }
}
