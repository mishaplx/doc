import { Inject, Injectable } from "@nestjs/common";
import "dotenv/config";

import { DataSource, Repository } from "typeorm";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { SmdoAbonentsEntity } from "../../entity/#organization/smdo/smdo_abonents.entity";
import { wLogger } from "../../modules/logger/logging.module";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { getOrderFindAllAbonents, getWhereFindAllAbonents } from "./abonents.utils";
import { GetAbonentsArgs } from "./dto/get-abonents.args";
import { OrderAbonentsInput } from "./dto/order-abonents-request.dto";
import { PaginatedAbonentsResponse } from "./dto/paginated-abonents-response.dto";

@Injectable()
export class AbonentsService {
  private readonly abonentsRepository: Repository<SmdoAbonentsEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.abonentsRepository = dataSource.getRepository(SmdoAbonentsEntity);
  }

  async get(
    serachValue: string,
    args: GetAbonentsArgs,
    pagination: PaginationInput,
    orderBy: OrderAbonentsInput,
    searchField: string,
  ): Promise<PaginatedAbonentsResponse> {
    try {
      const where = getWhereFindAllAbonents(serachValue, args);
      const order = getOrderFindAllAbonents(orderBy);
      const { pageNumber, pageSize, All } = pagination;
      if (searchField?.trim()) {
        const [abonents, total] = await searchAllColumnWithoutRelation(
          this.abonentsRepository,
          searchField,
          pageNumber,
          pageSize,
        );
        abonents.forEach((el) => (el.idOrgSmdo = el.getID));
        return paginatedResponseResult(abonents, pageNumber, pageSize, total);
      }
      const [abonents, total] = await getPaginatedData(
        this.abonentsRepository,
        pageNumber,
        pageSize,
        where,
        All,
        null,
        order,
      );

      abonents.forEach((el) => (el.idOrgSmdo = el.getID));
      return paginatedResponseResult(abonents, pageNumber, pageSize, total);
    } catch (e) {
      wLogger.error(e);
    }
  }
}
