import { Inject, Injectable } from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { DocPackageDeletedEntity } from "../../entity/#organization/docPackageDeleted/docPackageDeleted.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { setQueryBuilderDocPackageDeleted } from "./docPackageDeleted.utils";
import { GetDocPackagesDeletedArgs } from "./dto/get-doc-packages-deleted.args";
import { OrderDocPackagesDeletedInput } from "./dto/order-doc-packages-deleted-request.dto";
import { PaginatedDocPackagesDeletedResponse } from "./dto/paginated-doc-packages-deleted-response.dto";

@Injectable()
export class DocPackageDeletedService {
  private readonly dataSource: DataSource;
  private readonly docPackageDeletedRepository: Repository<DocPackageDeletedEntity>;
  private readonly docRepository: Repository<DocEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.docPackageDeletedRepository = dataSource.getRepository(DocPackageDeletedEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
  }

  async findAll(
    args: GetDocPackagesDeletedArgs,
    pagination: PaginationInput,
    orderBy: OrderDocPackagesDeletedInput,
  ): Promise<PaginatedDocPackagesDeletedResponse> {
    const queryBuilder = this.docPackageDeletedRepository.createQueryBuilder("doc_package_deleted");
    const { pageNumber, pageSize, All } = pagination;

    setQueryBuilderDocPackageDeleted(args, orderBy, queryBuilder);

    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [docPackages, total] = await queryBuilder.getManyAndCount();

    return paginatedResponseResult(docPackages, pageNumber, pageSize, total);
  }
}
