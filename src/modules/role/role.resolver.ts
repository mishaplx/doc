import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { MenuOptionsEntity } from "../../entity/#organization/role/menuOptions.entity";
import { RolesEntity } from "../../entity/#organization/role/role.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetRoleArgs } from "./dto/get-roles.args";
import { OrderRolesInput } from "./dto/order-roles-request.dto";
import { PaginatedRoleResponse } from "./dto/paginated-roles-response.dto";
import { UpdateRoleInput } from "./dto/update-role.input";
import { RoleService } from "./role.service";
@UseGuards(DeactivateGuard)
@Resolver(() => RolesEntity)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}
  @Query(() => PaginatedRoleResponse, {
    description: 'Получение справочника "Роли пользователя"',
  })
  getAllRoles(
    @Args() args: GetRoleArgs,
    @Args("pagination", {
      description: "Пагинация.",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderRolesInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedRoleResponse> {
    return this.roleService.findAll(args, pagination, order, searchField);
  }

  @Query(() => RolesEntity, {
    nullable: true,
    description: "Получения определённой роли пользователя",
  })
  async getRoleById(@Args("id", { type: () => Int }) id: number): Promise<RolesEntity> {
    return await this.roleService.findById(id);
  }

  @Query(() => [MenuOptionsEntity], {
    nullable: true,
    description: "Получения списка Меню",
  })
  async getMenuOps(): Promise<MenuOptionsEntity[] | HttpException> {
    return this.roleService.getMenuOps();
  }

  @Mutation(() => Int, { description: "Создание роли пользователя" })
  async createRole(@Token() token: IToken): Promise<number> {
    return this.roleService.create(token.current_emp_id);
  }
  @Mutation(() => RolesEntity, { description: "Создание Копии роли" })
  async copyRole(
    @Token() token: IToken,
    @Args("nameRole") nameRole: string,
    @Args("role_id") role_id: number,
  ): Promise<RolesEntity> {
    return this.roleService.copyRole(token.current_emp_id, nameRole, role_id);
  }

  @Mutation(() => RolesEntity, {
    nullable: true,
    description: "Редактирование роли пользователя",
  })
  updateRole(
    @Token() token: IToken,
    @Args("updateRoleInput") updateRoleInput: UpdateRoleInput,
  ): Promise<RolesEntity | Error> {
    return this.roleService.update(token.current_emp_id, updateRoleInput.id, updateRoleInput);
  }

  @Mutation(() => Boolean, { description: "Удаление роли пользователя" })
  async removeRole(
    @Token() token: IToken,
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.roleService.remove(token.current_emp_id, id);
  }
}
