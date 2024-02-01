import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { OrderCatalogEnum } from "../../common/enum/enum";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { getWhereFindAll } from "../../directories/directories.utils";
import { DeliveryEntity } from "../../entity/#organization/delivery/delivery.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { GetDeliverysArgs } from "./dto/get-delivery.args";
import { InputDto } from "./dto/input.dto";
import { PaginatedDeliveryResponse } from "./dto/paginated-delivery-response.dto";
import { UpdateDto } from "./dto/update";

@Injectable()
export class DeliveryService {
  private readonly deliveryRepository: Repository<DeliveryEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.deliveryRepository = dataSource.getRepository(DeliveryEntity);
  }

  async findAll(
    args: GetDeliverysArgs,
    pagination: PaginationInput,
    orderBy: OrderCatalogInput,
    searchField: string,
  ): Promise<PaginatedDeliveryResponse> {
    const where = getWhereFindAll(args);
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      const [delivery, total] = await searchAllColumnWithoutRelation(
        this.deliveryRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(delivery, pageNumber, pageSize, total);
    }
    const order = orderBy?.value === OrderCatalogEnum.nm ? { nm: orderBy.sortEnum } : null;
    const [delivery, total] = await getPaginatedData(
      this.deliveryRepository,
      pageNumber,
      pageSize,
      where,
      All,
      null,
      order,
    );

    return paginatedResponseResult(delivery, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<DeliveryEntity> {
    return this.deliveryRepository.findOneBy({ id });
  }

  async getAll(): Promise<DeliveryEntity[]> {
    return await this.deliveryRepository.find({});
  }

  async createDelivery(inputDto: InputDto): Promise<DeliveryEntity> {
    return await this.deliveryRepository.save({
      nm: inputDto.nm,
      del: false,
      temp: false,
    });
  }

  async deleteDelivery(id: number): Promise<DeliveryEntity> {
    const res = await this.deliveryRepository.findOneBy({ id: id });
    await this.deliveryRepository.delete({ id: id });
    return res;
  }

  async updateDelivery(update: UpdateDto): Promise<DeliveryEntity> {
    await this.deliveryRepository.update(
      { id: update.id },
      {
        nm: update.nm,
      },
    );
    return this.deliveryRepository.findOneBy({ id: update.id });
  }
}
