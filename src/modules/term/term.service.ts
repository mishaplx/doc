import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { OrderCatalogEnum } from "../../common/enum/enum";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { TermEntity } from "../../entity/#organization/term/term.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { CreateTermInput } from "./dto/create-term.input";
import { GetTermArgs } from "./dto/get-terms.args";
import { PaginatedTermResponse } from "./dto/paginated-term-response.dto";
import { UpdateTermInput } from "./dto/update-term.input";
import { getWhereFindAllTerm } from "./term.utils";

@Injectable()
export class TermService {
  private readonly termRepository: Repository<TermEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.termRepository = dataSource.getRepository(TermEntity);
  }

  async create(createTermInput: CreateTermInput): Promise<TermEntity> {
    const newTerm = this.termRepository.create(createTermInput);
    return await this.termRepository.save(newTerm);
  }

  async findAll(
    args: GetTermArgs,
    pagination: PaginationInput,
    orderBy: OrderCatalogInput,
    searchField: string,
  ): Promise<PaginatedTermResponse> {
    const where = getWhereFindAllTerm(args);
    const { pageNumber, pageSize, All } = pagination;

    const order = orderBy?.value === OrderCatalogEnum.nm ? { nm: orderBy.sortEnum } : null;
    if (searchField?.trim()) {
      const [term, total] = await searchAllColumnWithoutRelation(
        this.termRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(term, pageNumber, pageSize, total);
    }
    const [term, total] = await getPaginatedData(
      this.termRepository,
      pageNumber,
      pageSize,
      where,
      All,
      null,
      order,
    );

    return paginatedResponseResult(term, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<TermEntity> {
    return this.termRepository.findOneBy({ id });
  }

  async update(id: number, updateTermInput: UpdateTermInput): Promise<TermEntity> {
    await this.termRepository.update(id, updateTermInput);
    return this.termRepository.findOneByOrFail({ id });
  }

  async remove(id: number): Promise<boolean> {
    const { affected } = await this.termRepository.delete(id);
    return !!affected;
  }
}
