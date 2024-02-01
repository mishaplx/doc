import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { RlsAccessEmpEntity } from "../../../../entity/#organization/rls/rls.access.emp.entity";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  PaginatedRlsAccessEmpResponse,
  RlsAccessEmpDtoCreate,
  RlsAccessEmpDtoDel,
  RlsAccessEmpDtoGet,
  RlsAccessEmpDtoList,
  RlsAccessEmpDtoUpdate,
} from "./rlsAccessEmp.dto";
import { RlsAccessEmpService } from "./rlsAccessEmp.service";

const DESC = "RLS доступ по назначениям: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class RlsAccessEmpResolver {
  constructor(private rlsAccessEmpServ: RlsAccessEmpService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedRlsAccessEmpResponse, {
    description: DESC + "получить список",
  })
  async listRlsAccessEmp(
    @Args() args: RlsAccessEmpDtoList,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
  ): Promise<PaginatedRlsAccessEmpResponse | HttpException> {
    return this.rlsAccessEmpServ.listRlsAccessEmp(args, pagination);
  }

  /**
   * GET
   */
  @Query(() => RlsAccessEmpEntity, {
    description: DESC + "получить запись",
  })
  async getRlsAccessEmp(
    @Args() args: RlsAccessEmpDtoGet,
  ): Promise<RlsAccessEmpEntity | HttpException> {
    return this.rlsAccessEmpServ.getRlsAccessEmp(args);
  }

  /**
   * CREATE
   */
  @Mutation(() => RlsAccessEmpEntity, {
    description: DESC + "создать запись",
  })
  async createRlsAccessEmp(
    @Args() args: RlsAccessEmpDtoCreate,
  ): Promise<RlsAccessEmpEntity | HttpException> {
    return this.rlsAccessEmpServ.createRlsAccessEmp(args);
  }

  /**
   * UPDATE
   */
  @Mutation(() => RlsAccessEmpEntity, {
    description: DESC + "обновить запись",
  })
  async updateRlsAccessEmp(
    @Args() args: RlsAccessEmpDtoUpdate,
  ): Promise<RlsAccessEmpEntity | HttpException> {
    return this.rlsAccessEmpServ.updateRlsAccessEmp(args);
  }

  /**
   * DELETE
   */
  @Mutation(() => Boolean, {
    description: DESC + "удалить запись",
  })
  async deleteRlsAccessEmp(@Args() args: RlsAccessEmpDtoDel): Promise<boolean | HttpException> {
    return this.rlsAccessEmpServ.deleteRlsAccessEmp(args);
  }
}
