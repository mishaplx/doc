import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { SmdoStackEntity } from "../../entity/#organization/smdo/smdo_stack.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetStackArgs } from "./dto/get-stack.args";
import { OrderStackInput } from "./dto/order-stack-request.dto";
import { PaginatedStackResponse } from "./dto/paginated-stack-response.dto";
import { StackService } from "./stack.service";
@UseGuards(DeactivateGuard)
@Resolver(() => SmdoStackEntity)
export class StackResolver {
  constructor(private stackService: StackService) {}

  @Query(() => PaginatedStackResponse, {
    description: "СМДО очередь отправки",
  })
  async stackGet(
    @Args() args: GetStackArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderStackInput,
  ): Promise<PaginatedStackResponse> {
    return this.stackService.getStack(args, pagination, order);
  }

  @Query(() => Boolean, {
    description: "СМДО очередь отправки: удалить пакет",
  })
  async stackDelete(@Args("stackId") stackId: number): Promise<boolean> {
    return this.stackService.deleteStack(stackId);
  }


  @Mutation(() => SmdoStackEntity, {
    description: "СМДО очередь отправки: добавить пакет",
  })
  async stackAdd(
    @Token()
    token: IToken,

    @Args("body")
    body: string): Promise<SmdoStackEntity> {

    return this.stackService.addStack(body, token);
  }


  @Query(() => SmdoStackEntity, {
    description: "СМДО очередь отправки: измененить пакет",
  })
  async stackEdit(
    @Token() token: IToken,
    @Args("stackId") stackId: number,
    @Args("isActive", { nullable: true }) isActive: boolean,
    @Args("body", { nullable: true }) body: string,
  ): Promise<SmdoStackEntity> {
    return this.stackService.editStack(stackId, isActive, body, token);
  }
}
