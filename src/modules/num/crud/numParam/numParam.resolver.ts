import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { NumParamEntity } from "../../../../entity/#organization/num/numParam.entity";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  NumParamDtoCreate,
  NumParamDtoDel,
  NumParamDtoGet,
  NumParamDtoList,
  NumParamDtoUpdate,
  PaginatedNumParamResponse,
} from "./numParam.dto";
import { NumParamService } from "./numParam.service";

const DESC = "Параметры нумератора: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class NumParamResolver {
  constructor(private numParamServ: NumParamService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedNumParamResponse, {
    description: DESC + "получить список",
  })
  async listNumParam(
    @Args() args: NumParamDtoList,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
  ): Promise<PaginatedNumParamResponse | HttpException> {
    return this.numParamServ.listNumParam(args, pagination);
  }

  /**
   * GET
   */
  @Query(() => NumParamEntity, {
    description: DESC + "получить запись",
  })
  async getNumParam(@Args() args: NumParamDtoGet): Promise<NumParamEntity | HttpException> {
    return this.numParamServ.getNumParam(args);
  }

  /**
   * CREATE
   */
  @Mutation(() => NumParamEntity, {
    description: DESC + "создать запись",
  })
  async createNumParam(@Args() args: NumParamDtoCreate): Promise<NumParamEntity | HttpException> {
    return this.numParamServ.createNumParam(args);
  }

  /**
   * UPDATE
   */
  @Mutation(() => NumParamEntity, {
    description: DESC + "обновить запись",
  })
  async updateNumParam(@Args() args: NumParamDtoUpdate): Promise<NumParamEntity | HttpException> {
    return this.numParamServ.updateNumParam(args);
  }

  /**
   * DELETE
   */
  @Mutation(() => Boolean, {
    description: DESC + "удалить запись",
  })
  async deleteNumParam(@Args() args: NumParamDtoDel): Promise<boolean | HttpException> {
    return this.numParamServ.deleteNumParam(args);
  }
}
