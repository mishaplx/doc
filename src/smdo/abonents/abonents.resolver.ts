import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { SmdoAbonentsEntity } from "../../entity/#organization/smdo/smdo_abonents.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { AbonentsService } from "./abonents.service";
import { GetAbonentsArgs } from "./dto/get-abonents.args";
import { OrderAbonentsInput } from "./dto/order-abonents-request.dto";
import { PaginatedAbonentsResponse } from "./dto/paginated-abonents-response.dto";
@UseGuards(DeactivateGuard)
@Resolver(() => SmdoAbonentsEntity)
export class AbonentsResolver {
  constructor(private abonentsService: AbonentsService) {}

  @Query(() => PaginatedAbonentsResponse, {
    description: "Справочники абонентов СМДО",
  })
  async smdoAbonents(
    @Args("searchValue", {
      type: () => String,
      description: "поисковае значение",
      defaultValue: "",
      nullable: true,
    })
    searchValue: string,
    @Args() args: GetAbonentsArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderAbonentsInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedAbonentsResponse> {
    return this.abonentsService.get(searchValue, args, pagination, order, searchField);
  }
}
