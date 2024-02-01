import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Not, Repository } from "typeorm";

import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { DocumentTypes } from "../doc/doc.const";
import { OrderCatalogEnum } from "../../common/enum/enum";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { getWhereFindAll } from "../../directories/directories.utils";
import { KdocEntity } from "../../entity/#organization/doc/kdoc.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { GetKdocsArgs } from "./dto/get-kdocs.args";
import { PaginatedKdocResponse } from "./dto/paginated-kdoc-response.dto";

@Injectable()
export class KdocService {
  private readonly kdocRepository: Repository<KdocEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.kdocRepository = dataSource.getRepository(KdocEntity);
  }

  async findAll(
    args: GetKdocsArgs,
    pagination: PaginationInput,
    orderBy: OrderCatalogInput,
  ): Promise<PaginatedKdocResponse> {
    const where = getWhereFindAll(args);
    const { pageNumber, pageSize, All } = pagination;

    const order = orderBy?.value === OrderCatalogEnum.nm ? { nm: orderBy.sortEnum } : null;

    const [orgs, total] = await getPaginatedData(
      this.kdocRepository,
      pageNumber,
      pageSize,
      where,
      All,
      null,
      order,
    );

    return paginatedResponseResult(orgs, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<KdocEntity> {
    return this.kdocRepository.findOneBy({ id });
  }

  getAll(): Promise<KdocEntity[]> {
    return this.kdocRepository.find({});
  }

  async getAllTypeDocForProject(): Promise<KdocEntity[]> {
    return await this.kdocRepository.find({
      where: {
        id: Not(DocumentTypes.APPEAL),
      },
      order: {
        nm: "ASC",
      },
    });
  }
}
