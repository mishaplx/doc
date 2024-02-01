import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { OrderTdocInput } from "./dto/order-tdoc-request.dto";
import { IPaginatedResponseResult } from "../../common/interfaces/pagination.interface";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { TdocEntity } from "../../entity/#organization/doc/tdoc.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { GetTypeDocArgs } from "./dto/get-typeDoc.args";
import { TypesDocUpdate } from "./dto/typesdocDTO.type";
import { customError } from "../../common/type/errorHelper.type";
import { SmdoDocTypesEntity } from "../../entity/#organization/smdo/smdo_doc_types.entity";
import { setQueryBuilderTdoc } from "./typesdoc.utils";
import { globalSearchTdocBuilder } from "../../common/utils/utils.global.search";
import { UnputViewDto } from "./dto/unputView.dto";

@Injectable()
export class TypesDocService {
  private readonly typesDocRepository: Repository<TdocEntity>;
  private readonly smdoDocTypesRepository: Repository<SmdoDocTypesEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.typesDocRepository = dataSource.getRepository(TdocEntity);
    this.smdoDocTypesRepository = dataSource.getRepository(SmdoDocTypesEntity);
  }

  async getAllTypes(
    args: GetTypeDocArgs,
    pagination: PaginationInput,
    orderBy: OrderTdocInput,
    searchField: string,
  ): Promise<IPaginatedResponseResult<TdocEntity>> {
    const queryBuilder = this.typesDocRepository.createQueryBuilder("tdoc");
    const { pageNumber, pageSize, All } = pagination;

    setQueryBuilderTdoc(args, orderBy, queryBuilder);
    if (searchField?.trim()) {
      globalSearchTdocBuilder(queryBuilder, searchField);
    }

    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [tdoc, total] = await queryBuilder.getManyAndCount();
    return paginatedResponseResult(tdoc, pageNumber, pageSize, total);
  }

  async getAllDocView(): Promise<TdocEntity[]> {
    return this.typesDocRepository.findBy({ temp: false });
  }

  async createTypeDoc(viewdocInput: UnputViewDto): Promise<TdocEntity> {
    if (viewdocInput.smdoDocTypes) {
      const isSmdoDocType = await this.smdoDocTypesRepository.findOneBy({
        name: viewdocInput.smdoDocTypes,
      });
      if (!isSmdoDocType) customError("Вид документа СМДО не найден");
    }
    viewdocInput.dtc = new Date();
    viewdocInput.temp = false;
    return await this.typesDocRepository.save(viewdocInput);
  }

  async updateTypeDoc(typeDocUpdate: TypesDocUpdate): Promise<TdocEntity> {
    if (typeDocUpdate.smdoDocTypes) {
      const isSmdoDocType = await this.smdoDocTypesRepository.findOneBy({
        name: typeDocUpdate.smdoDocTypes,
      });
      if (!isSmdoDocType) customError("Вид документа СМДО не найден");
    }
    await this.typesDocRepository.update(
      {
        id: typeDocUpdate.id,
      },
      typeDocUpdate,
    );
    return await this.typesDocRepository.findOneByOrFail({
      id: typeDocUpdate.id,
    });
  }

  async deleteTypeDoc(id: number): Promise<boolean> {
    await this.typesDocRepository.delete({ id: id });
    return true;
  }

  async getViewDocByid(id: number): Promise<TdocEntity | null> {
    return await this.typesDocRepository.findOne({
      where: {
        id: id,
      },
    });
  }
}
