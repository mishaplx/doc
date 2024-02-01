import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../../auth/guard/police.guard";
import { NumEntity } from "../../../../entity/#organization/num/num.entity";
import { PaginationInput, defaultPaginationValues } from "../../../../pagination/paginationDTO";
import {
  GetNumArgs,
  NumDtoCreate,
  NumDtoDel,
  NumDtoGet,
  NumDtoList,
  NumDtoUpdate,
  OrderNumInput,
  PaginatedNumResponse,
} from "./num.dto";
import { NumService } from "./num.service";

const DESC = "Нумератор: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class NumResolver {
  constructor(private numServ: NumService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedNumResponse, {
    description: DESC + "получить список",
  })
  async listNum(
    @Args() args: GetNumArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderNumInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedNumResponse | HttpException> {
    return this.numServ.listNum(args, pagination, order, searchField);
  }

  /**
   * GET
   */
  @Query(() => NumEntity, {
    description: DESC + "получить запись",
  })
  async getNum(@Args() args: NumDtoGet): Promise<NumEntity | HttpException> {
    return this.numServ.getNum(args);
  }

  /**
   * CREATE
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => NumEntity, {
    description: DESC + "создать запись",
  })
  async createNum(@Args() args: NumDtoCreate): Promise<NumEntity | HttpException> {
    return this.numServ.createNum(args);
  }

  /**
   * UPDATE
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => NumEntity, {
    description: DESC + "обновить запись",
  })
  async updateNum(@Args() args: NumDtoUpdate): Promise<NumEntity | HttpException> {
    return this.numServ.updateNum(args);
  }

  /**
   * DELETE
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: DESC + "удалить запись",
  })
  async deleteNum(@Args() args: NumDtoDel): Promise<boolean | HttpException> {
    return this.numServ.deleteNum(args);
  }
}
