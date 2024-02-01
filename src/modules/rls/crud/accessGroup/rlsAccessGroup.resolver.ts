import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { RlsAccessGroupEntity } from "../../../../entity/#organization/rls/rls.access.group.entity";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  PaginatedRlsAccessGroupResponse,
  RlsAccessGroupDtoCreate,
  RlsAccessGroupDtoDel,
  RlsAccessGroupDtoGet,
  RlsAccessGroupDtoList,
  RlsAccessGroupDtoUpdate,
} from "./rlsAccessGroup.dto";
import { RlsAccessGroupService } from "./rlsAccessGroup.service";

const DESC = "RLS доступ по группам назначений: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class RlsAccessGroupResolver {
  constructor(private rlsAccessGroupServ: RlsAccessGroupService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedRlsAccessGroupResponse, {
    description: DESC + "получить список",
  })
  async listRlsAccessGroup(
    @Args() args: RlsAccessGroupDtoList,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
  ): Promise<PaginatedRlsAccessGroupResponse | HttpException> {
    return this.rlsAccessGroupServ.listRlsAccessGroup(args, pagination);
  }

  /**
   * GET
   */
  @Query(() => RlsAccessGroupEntity, {
    description: DESC + "получить запись",
  })
  async getRlsAccessGroup(
    @Args() args: RlsAccessGroupDtoGet,
  ): Promise<RlsAccessGroupEntity | HttpException> {
    return this.rlsAccessGroupServ.getRlsAccessGroup(args);
  }

  /**
   * CREATE
   */
  @Mutation(() => RlsAccessGroupEntity, {
    description: DESC + "создать запись",
  })
  async createRlsAccessGroup(
    @Args() args: RlsAccessGroupDtoCreate,
  ): Promise<RlsAccessGroupEntity | HttpException> {
    return this.rlsAccessGroupServ.createRlsAccessGroup(args);
  }

  /**
   * UPDATE
   */
  @Mutation(() => RlsAccessGroupEntity, {
    description: DESC + "обновить запись",
  })
  async updateRlsAccessGroup(
    @Args() args: RlsAccessGroupDtoUpdate,
  ): Promise<RlsAccessGroupEntity | HttpException> {
    return this.rlsAccessGroupServ.updateRlsAccessGroup(args);
  }

  /**
   * DELETE
   */
  @Mutation(() => Boolean, {
    description: DESC + "удалить запись",
  })
  async deleteRlsAccessGroup(@Args() args: RlsAccessGroupDtoDel): Promise<boolean | HttpException> {
    return this.rlsAccessGroupServ.deleteRlsAccessGroup(args);
  }
}
