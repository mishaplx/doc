import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { RlsGroupEntity } from "../../../../entity/#organization/rls/rls.group.entity";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  PaginatedRlsGroupResponse,
  RlsGroupDtoCreate,
  RlsGroupDtoDel,
  RlsGroupDtoGet,
  RlsGroupDtoList,
  RlsGroupDtoUpdate,
} from "./rlsGroup.dto";
import { RlsGroupService } from "./rlsGroup.service";

const DESC = "RLS группы назначений: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class RlsGroupResolver {
  constructor(private rlsGroupServ: RlsGroupService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedRlsGroupResponse, {
    description: DESC + "получить список",
  })
  async listRlsGroup(
    @Args() args: RlsGroupDtoList,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
  ): Promise<PaginatedRlsGroupResponse | HttpException> {
    return this.rlsGroupServ.listRlsGroup(args, pagination);
  }

  /**
   * GET
   */
  @Query(() => RlsGroupEntity, {
    description: DESC + "получить запись",
  })
  async getRlsGroup(@Args() args: RlsGroupDtoGet): Promise<RlsGroupEntity | HttpException> {
    return this.rlsGroupServ.getRlsGroup(args);
  }

  /**
   * CREATE
   */
  @Mutation(() => RlsGroupEntity, {
    description: DESC + "создать запись",
  })
  async createRlsGroup(@Args() args: RlsGroupDtoCreate): Promise<RlsGroupEntity | HttpException> {
    return this.rlsGroupServ.createRlsGroup(args);
  }

  /**
   * UPDATE
   */
  @Mutation(() => RlsGroupEntity, {
    description: DESC + "обновить запись",
  })
  async updateRlsGroup(@Args() args: RlsGroupDtoUpdate): Promise<RlsGroupEntity | HttpException> {
    return this.rlsGroupServ.updateRlsGroup(args);
  }

  /**
   * DELETE
   */
  @Mutation(() => Boolean, {
    description: DESC + "удалить запись",
  })
  async deleteRlsGroup(@Args() args: RlsGroupDtoDel): Promise<boolean | HttpException> {
    return this.rlsGroupServ.deleteRlsGroup(args);
  }
}
