import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { OperationEntity } from "../../entity/#organization/role/operation.entity";
import { GetOperationArgs } from "./dto/get-operations.args";
import { setQueryBuilderOperation } from "./operation.utils";

@Injectable()
export class OperationService {
  private readonly operationRepository: Repository<OperationEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.operationRepository = dataSource.getRepository(OperationEntity);
  }

  async findAll(args: GetOperationArgs): Promise<OperationEntity[]> {
    const queryBuilder = this.operationRepository.createQueryBuilder("operation");
    setQueryBuilderOperation(args, queryBuilder);

    return queryBuilder.getMany();
  }
}
