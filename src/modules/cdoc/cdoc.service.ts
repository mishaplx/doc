import { Inject, Injectable } from "@nestjs/common";
import { paginatedResponseResult } from "src/pagination/pagination.service";
import { DataSource, Repository } from "typeorm";

import { PaginationInput } from "../../pagination/paginationDTO";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { CdocEntity } from "../../entity/#organization/doc/cdoc.entity";
import { setQueryBuilderCdoc } from "./cdoc.utils";
import { GetCdocArgs } from "./dto/get-cdoc.args";
import { OrderCdocInput } from "./dto/order-cdoc-request.dto";
import { PaginatedCdocResponse } from "./dto/paginated-cdoc-response.dto";
import { globalSearchCdocBuilder } from "../../common/utils/utils.global.search";

@Injectable()
export class CdocService {
  private readonly cdocRepository: Repository<CdocEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.cdocRepository = dataSource.getRepository(CdocEntity);
  }

  async findAll(
    args: GetCdocArgs,
    pagination: PaginationInput,
    orderBy: OrderCdocInput,
    searchField: string,
  ): Promise<PaginatedCdocResponse> {
    const queryBuilder = this.cdocRepository.createQueryBuilder("cdoc");
    const { pageNumber, pageSize, All } = pagination;

    setQueryBuilderCdoc(args, orderBy, queryBuilder);
    if (searchField?.trim()) {
      globalSearchCdocBuilder(queryBuilder, searchField);
    }

    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [cdoc, total] = await queryBuilder.getManyAndCount();
    return paginatedResponseResult(cdoc, pageNumber, pageSize, total);
  }
}
