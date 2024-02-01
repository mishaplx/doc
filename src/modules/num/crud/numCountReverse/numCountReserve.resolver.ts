import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { NumCountReserveEntity } from "../../../../entity/#organization/num/numCountReserve.entity";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  NumCountReserveDtoCreate,
  NumCountReserveDtoDel,
  NumCountReserveDtoGet,
  NumCountReserveDtoList,
  NumCountReserveDtoUpdate,
  PaginatedNumCountReserveResponse,
} from "./numCountReserve.dto";
import { NumCountReserveService } from "./numCountReserve.service";

const DESC = "Зарезервированные номера счетчика нумератора: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class NumCountReserveResolver {
  constructor(private numCountReserveServ: NumCountReserveService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedNumCountReserveResponse, {
    description: DESC + "получить список",
  })
  async listNumCountReserve(
    @Args() args: NumCountReserveDtoList,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
  ): Promise<PaginatedNumCountReserveResponse | HttpException> {
    return this.numCountReserveServ.listNumCountReserve(args, pagination);
  }

  /**
   * GET
   */
  @Query(() => NumCountReserveEntity, {
    description: DESC + "получить запись",
  })
  async getNumCountReserve(
    @Args() args: NumCountReserveDtoGet,
  ): Promise<NumCountReserveEntity | HttpException> {
    return this.numCountReserveServ.getNumCountReserve(args);
  }

  /**
   * CREATE
   */
  @Mutation(() => NumCountReserveEntity, {
    description: DESC + "создать запись",
  })
  async createNumCountReserve(
    @Args() args: NumCountReserveDtoCreate,
  ): Promise<NumCountReserveEntity | HttpException> {
    return this.numCountReserveServ.createNumCountReserve(args);
  }

  /**
   * UPDATE
   */
  @Mutation(() => NumCountReserveEntity, {
    description: DESC + "обновить запись",
  })
  async updateNumCountReserve(
    @Args() args: NumCountReserveDtoUpdate,
  ): Promise<NumCountReserveEntity | HttpException> {
    return this.numCountReserveServ.updateNumCountReserve(args);
  }

  /**
   * DELETE
   */
  @Mutation(() => Boolean, {
    description: DESC + "удалить запись",
  })
  async deleteNumCountReserve(
    @Args() args: NumCountReserveDtoDel,
  ): Promise<boolean | HttpException> {
    return this.numCountReserveServ.deleteNumCountReserve(args);
  }
}
