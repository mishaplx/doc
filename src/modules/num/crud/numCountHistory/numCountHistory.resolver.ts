import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { NumCountHistoryEntity } from "../../../../entity/#organization/num/numCountHistory.entity";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  NumCountHistoryDtoCreate,
  NumCountHistoryDtoDel,
  NumCountHistoryDtoGet,
  NumCountHistoryDtoList,
  PaginatedNumCountHistoryResponse,
} from "./numCountHistory.dto";
import { NumCountHistoryService } from "./numCountHistory.service";

const DESC = "История счетчика нумератора: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class NumCountHistoryResolver {
  constructor(private numCountHistoryServ: NumCountHistoryService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedNumCountHistoryResponse, {
    description: DESC + "получить список",
  })
  async listNumCountHistory(
    @Args() args: NumCountHistoryDtoList,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
  ): Promise<PaginatedNumCountHistoryResponse | HttpException> {
    return this.numCountHistoryServ.listNumCountHistory(args, pagination);
  }

  /**
   * GET
   */
  @Query(() => NumCountHistoryEntity, {
    description: DESC + "получить запись",
  })
  async getNumCountHistory(
    @Args() args: NumCountHistoryDtoGet,
  ): Promise<NumCountHistoryEntity | HttpException> {
    return this.numCountHistoryServ.getNumCountHistory(args);
  }

  /**
   * CREATE
   */
  @Mutation(() => NumCountHistoryEntity, {
    description: DESC + "создать запись",
  })
  async createNumCountHistory(
    @Args() args: NumCountHistoryDtoCreate,
  ): Promise<NumCountHistoryEntity | HttpException> {
    return this.numCountHistoryServ.createNumCountHistory(args);
  }

  // отключено за ненадобностью
  // /**
  //  * UPDATE
  //  */
  // @Mutation(() => NumCountHistoryEntity, {
  //   description: DESC+'обновить запись',
  // })
  // async updateNumCountHistory(
  //   @Args() args: NumCountHistoryDtoUpdate,
  // ): Promise<NumCountHistoryEntity | HttpException> {
  //   return this.numCountHistoryServ.updateNumCountHistory(args);
  // }

  /**
   * DELETE
   */
  @Mutation(() => Boolean, {
    description: DESC + "удалить запись",
  })
  async deleteNumCountHistory(
    @Args() args: NumCountHistoryDtoDel,
  ): Promise<boolean | HttpException> {
    return this.numCountHistoryServ.deleteNumCountHistory(args);
  }
}
