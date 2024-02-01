import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { isPublic } from "../../auth/decorator/public.decorator";
import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { CreateStaffInput } from "./dto/create-staff.input";
import { GetStaffArgs } from "./dto/get-staff.args";
import { OrderStaffInput } from "./dto/order-staff-request.dto";
import { PaginatedStaffResponse } from "./dto/paginated-staff-response.dto";
import { UpdateStaffInput } from "./dto/update-staff.input";
import { StaffService } from "./staff.service";
@UseGuards(DeactivateGuard)
@Resolver(() => StaffEntity)
export class StaffResolver {
  constructor(private staffService: StaffService) {}
  @Mutation(() => StaffEntity, {
    description: 'Добавление записи в справочник "Сотрудники"',
  })
  createStaff(@Args("createStaffInput") createStaffInput: CreateStaffInput): Promise<StaffEntity> {
    return this.staffService.create(createStaffInput);
  }

  @Query(() => PaginatedStaffResponse, {
    description: 'Получение справочника "Сотрудники"',
  })
  @isPublic()
  getAllStaff(
    @Args() args: GetStaffArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderStaffInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedStaffResponse> {
    return this.staffService.findAll(args, pagination, order, searchField);
  }
  @Query(() => StaffEntity, {
    nullable: true,
    description: 'Получение записи справочника "Сотрудники"',
  })
  staff(@Args("id", { type: () => Int }) id: number): Promise<StaffEntity> {
    return this.staffService.findOne(id);
  }

  @Mutation(() => StaffEntity, {
    description: 'Редактирование записи справочника "Сотрудники"',
  })
  updateStaff(@Args("updateStaffInput") updateStaffInput: UpdateStaffInput): Promise<StaffEntity> {
    return this.staffService.update(updateStaffInput.id, updateStaffInput);
  }
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Сотрудники"',
  })
  removeStaff(@Args("id", { type: () => Int }) id: number): Promise<boolean | HttpException> {
    return this.staffService.remove(id);
  }
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Сотрудники"',
  })
  changePhoneNumber(
    @Args("phoneNumber", { type: () => String }) phoneNumber: string,
    @Token() token: IToken,
  ): Promise<boolean | HttpException> {
    return this.staffService.changePhoneNumber(phoneNumber, token);
  }
}
