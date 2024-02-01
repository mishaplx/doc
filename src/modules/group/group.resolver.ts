import { UseGuards } from "@nestjs/common";
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { EmpGroupingEntity } from "../../entity/#organization/emp_grouping/emp_grouping.entity";
import { GroupingEntity } from "../../entity/#organization/grouping/grouping.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetGroupArgs } from "./dto/get-group.args";
import { OrderGroupInput } from "./dto/order-group-request.dto";
import { PaginatedGroupResponseDictionary } from "./dto/paginated-group-response-dictionary.dto";
import { PaginatedGroupResponse } from "./dto/pagination-group-response.dto";
import { resposneGetGroupe } from "./group.interface";
import GroupService from "./group.service";
@Resolver()
@UseGuards(DeactivateGuard)
export default class GroupResolver {
  constructor(private groupServ: GroupService) {}

  @UseGuards(PoliceGuard)
  @Query(() => PaginatedGroupResponse)
  async getAllGroup(
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedGroupResponse> {
    return this.groupServ.getAllGroup(pagination, searchField);
  }

  @Query(() => PaginatedGroupResponseDictionary, {
    description: "Получение справочника групп",
  })
  async getGroupDictionary(
    @Args() args: GetGroupArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderGroupInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedGroupResponseDictionary> {
    return this.groupServ.getGroupDictionary(args, pagination, order, searchField);
  }

  @Query(() => [resposneGetGroupe], { description: "получение группы по ID" })
  getGroupeById(
    @Args("idGroup", { type: () => Int, description: "id группы", nullable: false })
    idGroup: number,
  ): Promise<resposneGetGroupe> {
    return this.groupServ.getGroupeById(idGroup);
  }

  @Query(() => [resposneGetGroupe], { description: "получение данных для создания группы" })
  getGroupForCreate(): Promise<resposneGetGroupe> {
    return this.groupServ.getGroupForCreate();
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => GroupingEntity, {
    description: "добавление пользователя в группу",
  })
  async addUserInGroup(
    @Args("idUserArr", { type: () => [Int], description: "id сотрудника" })
    idUserArr: number[],
    @Args("idGroup", { type: () => Int || null, description: "id группы", nullable: true })
    idGroup: number | null,
    @Args("nameGroupe", { description: "id группы" }) nameGroupe: string,
  ): Promise<HttpException | GroupingEntity> {
    return this.groupServ.addUserInGroup(idUserArr, idGroup, nameGroupe);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => [GroupingEntity], {
    description: "удаление пользователя из группы",
  })
  async deleteUserInGroup(
    @Args("idUser", { description: "id сотрудника" }) idUser: number,
    @Args("idGroup", { description: "id группы" }) idGroup: number,
  ): Promise<HttpException> {
    return this.groupServ.deleteUserInGroup(idUser, idGroup);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: "удаление группы",
  })
  async deleteGroup(
    @Args("id", { description: "id группы" }) id: number,
  ): Promise<boolean | HttpException> {
    return this.groupServ.deleteGroup(id);
  }

  @Query(() => [EmpGroupingEntity])
  async getAllUserInCurrentGroupe(
    @Args("id", { description: "id группы" }) id: number,
  ): Promise<EmpGroupingEntity[]> {
    return this.groupServ.getAllUserInCurrentGroupe(id);
  }
}
