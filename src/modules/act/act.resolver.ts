import { UseGuards } from "@nestjs/common";
import { Args, Context, GqlContextType, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { ActEntity } from "../../entity/#organization/act/act.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { ActService } from "./act.service";
import { GetActArgs } from "./dto/get-act.args";
import { OrderActInput } from "./dto/order-act-request.dto";
import { PaginatedActResponse } from "./dto/paginated-act-response.dto";
import { UpdateActInput } from "./dto/update-act.input";

@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => ActEntity)
export class ActResolver {
  constructor(private readonly actService: ActService) {}

  @Query(() => PaginatedActResponse, {
    description: "Получение актов",
  })
  getAllAct(
    @Args() args: GetActArgs,
    @Args("pagination", {
      description: "Пагинация.",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderActInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedActResponse> {
    return this.actService.findAll(args, pagination, order, searchField);
  }

  @Query(() => ActEntity, {
    nullable: true,
    description: "Получение определённого акта",
  })
  async getActById(@Args("id", { type: () => Int }) id: number): Promise<ActEntity> {
    return await this.actService.findById(id);
  }

  @Mutation(() => Int, { description: "Создание акта" })
  async createAct(@Token() token: IToken): Promise<number> {
    return this.actService.create(token.current_emp_id);
  }

  @Mutation(() => ActEntity, { description: "Редактирование акта" })
  updateAct(
    @Args("updateActInput") updateActInput: UpdateActInput,
    @Token() token: IToken,
  ): Promise<ActEntity> {
    return this.actService.update(updateActInput.id, updateActInput, token);
  }

  @Mutation(() => Boolean, { description: "Удалить акт" })
  deleteAct(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.actService.delete(id);
  }

  @Mutation(() => Boolean, { description: "Подписать акт" })
  signAct(
    @Token() token: IToken,
    @Args("id", { type: () => Int, description: "Id акта" }) id: number,
    @Args("sign", { type: () => String, description: "ЭЦП в PEM-формате" }) sign: string,
  ): Promise<boolean> {
    return this.actService.sign(id, sign, token.current_emp_id);
  }

  @Mutation(() => Boolean, { description: "Удалить дела по акту" })
  deleteDocPackageByAct(
    @Context() context: GqlContextType,
    @Token() token: IToken,
    @Args("id", { type: () => Int, description: "Id акта" }) id: number,
  ): Promise<boolean> {
    return this.actService.deleteDocPackageByAct(id, token.current_emp_id, context);
  }
}
