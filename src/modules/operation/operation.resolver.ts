import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { OperationEntity } from "../../entity/#organization/role/operation.entity";
import { GetOperationArgs } from "./dto/get-operations.args";
import { OperationService } from "./operation.service";
@UseGuards(DeactivateGuard)
@Resolver(() => OperationEntity)
export class OperationResolver {
  constructor(private readonly operationService: OperationService) {}

  @Query(() => [OperationEntity], {
    description: 'Получение справочника "Операции"',
  })
  getAllOperations(@Args() args: GetOperationArgs): Promise<OperationEntity[]> {
    return this.operationService.findAll(args);
  }
}
