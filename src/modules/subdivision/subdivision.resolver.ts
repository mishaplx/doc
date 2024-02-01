import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { UseGuards } from "@nestjs/common";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { TypeUnitInput } from "../../common/type/TypeUnitInput.type";
import { UnitEntity } from "../../entity/#organization/unit/unit.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetUnitArgs } from "./dto/get-unit";
import { OrderUnitInput } from "./dto/order-unit-request.dto";
import { PaginatedUnitResponse } from "./dto/subdivision-response";
import { SubdivisionService } from "./subdivision.service";
@UseGuards(DeactivateGuard)
@Resolver(() => UnitEntity)
export class SubdivisionResolver {
  constructor(private UnitServ: SubdivisionService) {}

  @Query(() => PaginatedUnitResponse, {
    description: "получить все подразделения",
  })
  async getAllUnit(
    @Args() args: GetUnitArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderUnitInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedUnitResponse> {
    return await this.UnitServ.getAllUnit(args, pagination, order, searchField);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => UnitEntity, { description: "создание подразделения" })
  async createUnit(@Args("input") input: TypeUnitInput): Promise<UnitEntity> {
    return await this.UnitServ.createUnit(input);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => UnitEntity, { description: "update подразделения" })
  async updateUnit(@Args("update") input: TypeUnitInput): Promise<UnitEntity> {
    return await this.UnitServ.updateUnit(input);
  }

  @Query(() => UnitEntity, { description: "" })
  async getUnitById(@Args("id") id: number): Promise<UnitEntity> {
    return await this.UnitServ.getUnitById(id);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => UnitEntity, { description: "delete подразделение " })
  async deleteUnit(@Args("id") id: number): Promise<UnitEntity> {
    return await this.UnitServ.deleteUnit(id);
  }

  @Query(() => [UnitEntity], {
    description: "получит подразделения которые соответствуют по дате db >= curr_date <= de",
  })
  async getActiveUnit(): Promise<UnitEntity[]> {
    return await this.UnitServ.getActiveUnitCode();
  }
}
