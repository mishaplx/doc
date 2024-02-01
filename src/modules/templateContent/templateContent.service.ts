import { Inject, Injectable } from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { TemplateContentEntity } from "../../entity/#organization/templateContent/template_content.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { CreateTemplateContentInput } from "./dto/create-templateContent.input";
import { GetTemplateContentArgs } from "./dto/get-templateContent.args";
import { OrderTemplateContentInput } from "./dto/order-templateContent-request.dto";
import { PaginatedTemplateContentResponse } from "./dto/paginated-templateContent-response.dto";
import { UpdateTemplatecontentInput } from "./dto/update-templatecontent.input";
import { getOrderFindAllTemp, getWhereFindAllTemp } from "./templateContent.utils";

@Injectable()
export class TemplateContentService {
  private readonly templateContentEntityRepository: Repository<TemplateContentEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.templateContentEntityRepository = dataSource.getRepository(TemplateContentEntity);
  }

  async create(createTempContentInput: CreateTemplateContentInput): Promise<TemplateContentEntity> {
    const newTempContent = this.templateContentEntityRepository.create(createTempContentInput);

    const { id } = await this.templateContentEntityRepository.save(newTempContent);
    return this.templateContentEntityRepository.findOneByOrFail({ id });
  }

  async findAll(
    args: GetTemplateContentArgs,
    pagination: PaginationInput,
    orderBy: OrderTemplateContentInput,
    searchField: string,
  ): Promise<PaginatedTemplateContentResponse> {
    const where = getWhereFindAllTemp(args);
    const order = getOrderFindAllTemp(orderBy);
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      const [template, total] = await searchAllColumnWithoutRelation(
        this.templateContentEntityRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(template, pageNumber, pageSize, total);
    }
    const [template, total] = await getPaginatedData(
      this.templateContentEntityRepository,
      pageNumber,
      pageSize,
      where,
      All,
      null,
      order,
    );

    return paginatedResponseResult(template, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<TemplateContentEntity> {
    return this.templateContentEntityRepository.findOneBy({ id: id, del: false });
  }

  async update(
    id: number,
    updateTempConInput: UpdateTemplatecontentInput,
  ): Promise<TemplateContentEntity> {
    await this.templateContentEntityRepository.update(id, updateTempConInput);
    return await this.templateContentEntityRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async remove(id: number): Promise<boolean> {
    const { affected } = await this.templateContentEntityRepository.update(id, { del: true });
    return !!affected;
  }
}
