import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { EmpReplaceEntity } from "../../../entity/#organization/emp_replace/emp_replace.entity";
import { PaginationInput, defaultPaginationValues } from "../../../pagination/paginationDTO";
import { getAllEmpForCurrentUser, getEmp, getEmpInterface } from "../empReplace.interface";
import { CreateEmpReplaceDto } from "./dto/createEmpReplace.dto";
import { GetListEmpReplace } from "./dto/get-list-emp-replace";
import { OrderEmpReplaceInput } from "./dto/order-emp-replace-request.dto";
import { PaginationEmpReplaceDto } from "./dto/pagination-emp-replace.dto";
import { UpdateEmpReplaceDto } from "./dto/updateEmpReplace.dto";
import { EmpReplaceService } from "./empReplace.service";
@UseGuards(DeactivateGuard)
@Resolver(() => EmpReplaceEntity)
export class EmpReplaceResolver {
  constructor(private readonly empReplaceService: EmpReplaceService) {}

  @UseGuards(PoliceGuard)
  @Query(() => PaginationEmpReplaceDto)
  getAllEmpReplace(
    @Args() args: GetListEmpReplace,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderEmpReplaceInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginationEmpReplaceDto> {
    return this.empReplaceService.getAllEmpReplace(args, pagination, order, searchField);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => EmpReplaceEntity, {
    description: "Добавление записи в форму замещения",
  })
  createEmpReplace(
    @Args("CreateEmpReplaceDto") CreateEmpReplaceDto: CreateEmpReplaceDto,
  ): Promise<EmpReplaceEntity> {
    return this.empReplaceService.creatEmpReplace(CreateEmpReplaceDto);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: "Добавление записи в форму замещения",
  })
  deleteEmpReplace(@Args("id") id: number): Promise<boolean | HttpException> {
    return this.empReplaceService.deleteEmpReplace(id);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => EmpReplaceEntity, {
    description: "Обновление",
  })
  updateEmpReplace(
    @Args("updateEmpReplaceDTO") updateEmpReplaceDTO: UpdateEmpReplaceDto,
  ): Promise<EmpReplaceEntity | HttpException> {
    return this.empReplaceService.updateEmpReplace(updateEmpReplaceDTO);
  }

  @Query(() => EmpReplaceEntity)
  getEmpReplaceById(@Args("id") id: number): Promise<EmpReplaceEntity> {
    return this.empReplaceService.getEmpReplaceById(id);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: "активация записи",
  })
  activateEmpReplace(
    @Args("id") id: number,
    @Args("flag", { description: "true - активировать запись, false- деактивировать запись" })
    flag: boolean,
  ): Promise<boolean | HttpException> {
    return this.empReplaceService.activateEmpReplace(id, flag);
  }
  @Query(() => [getAllEmpForCurrentUser], {
    description: "Получение все текущих назначений текущего пользователя",
  })
  getAllEmpForCurrentUser(
    @Token() token: IToken,
  ): Promise<getAllEmpForCurrentUser[] | HttpException> {
    return this.empReplaceService.getAllEmpForCurrentUser(token);
  }

  @Mutation(() => Boolean, {
    description: "Получение все текущих назначений текущего пользователя",
  })
  SetEmpForCurrentUser(
    @Token() token: IToken,
    @Args("idEmp", { type: () => Int }) idEmp: number,
  ): Promise<boolean | HttpException> {
    return this.empReplaceService.SetEmpForCurrentUser(token, idEmp);
  }
  @Query(() => getEmp, {
    description: "Получение Emp и Posts",
  })
  getEmp(@Args("id") id: number): Promise<getEmpInterface | HttpException> {
    return this.empReplaceService.getEmp(id);
  }
}
