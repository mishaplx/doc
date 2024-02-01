import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { CdocEntity } from "../../entity/#organization/doc/cdoc.entity";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { CdocService } from "./cdoc.service";
import { PaginatedCdocResponse } from "./dto/paginated-cdoc-response.dto";
import { GetCdocArgs } from "./dto/get-cdoc.args";
import { defaultPaginationValues, PaginationInput } from "src/pagination/paginationDTO";
import { OrderCdocInput } from "./dto/order-cdoc-request.dto";

@UseGuards(DeactivateGuard)
@Resolver(() => CdocEntity)
export class CdocResolver {
  constructor(private readonly cdocService: CdocService) {}

  @Query(() => PaginatedCdocResponse, {
    description: 'Получение справочника "Класс документа"',
  })
  getAllCdoc(
    @Args() args: GetCdocArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
        nullable: true,
        description: "Сортировка",
    })
    order?: OrderCdocInput,
    @Args("searchField", {
        nullable: true,
        description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedCdocResponse> {
    return this.cdocService.findAll(args, pagination, order, searchField);
  }
}
