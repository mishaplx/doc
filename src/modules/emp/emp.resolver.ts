import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { CreateEmpInput } from "./dto/create-emp.input";
import { GetEmpArgs } from "./dto/get-emp.args";
import { OrderEmpInput } from "./dto/order-emp-request.dto";
import { PaginatedEmpResponse } from "./dto/paginated-emp-response.dto";
import { UpdateEmpInput } from "./dto/update-emp.input";
import { EmpService } from "./emp.service";

@UseGuards(DeactivateGuard)
@Resolver(() => EmpEntity)
export class EmpResolver {
  constructor(private readonly empService: EmpService) {}
  @UseGuards(PoliceGuard)
  @Mutation(() => EmpEntity, {
    description: 'Добавление записи в справочник "Текущие назначения" и назначение пользователя',
  })
  createEmp(
    @Args("createEmpInput") createEmpInput: CreateEmpInput,
  ): Promise<EmpEntity | HttpException> {
    return this.empService.create(createEmpInput);
  }

  @Query(() => PaginatedEmpResponse, {
    description: 'Получение справочника "Текущие назначения"',
  })
  getAllEmp(
    @Args() args: GetEmpArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderEmpInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedEmpResponse> {
    return this.empService.findAll(args, pagination, order, searchField);
  }

  @Query(() => EmpEntity, {
    nullable: true,
    description: 'Получение записи справочника "Текущие назначения"',
  })
  findOneEmp(@Args("id", { type: () => Int }) id: number): Promise<EmpEntity> {
    return this.empService.findOne(id);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => EmpEntity, {
    description: 'Редактирование записи справочника "Текущие назначения"',
  })
  updateEmp(
    @Args("updateEmpInput") updateEmpInput: UpdateEmpInput,
  ): Promise<EmpEntity | HttpException> {
    return this.empService.update(updateEmpInput.id, updateEmpInput);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Текущие назначения"',
  })
  removeEmp(@Args("id", { type: () => Int }) id: number): Promise<boolean | HttpException> {
    return this.empService.remove(id);
  }
}
