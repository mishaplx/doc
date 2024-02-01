import { Args, Query, Resolver } from "@nestjs/graphql";

import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { KdocEntity } from "../../entity/#organization/doc/kdoc.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetKdocsArgs } from "./dto/get-kdocs.args";
import { PaginatedKdocResponse } from "./dto/paginated-kdoc-response.dto";
import { KdocService } from "./kdoc.service";

@Resolver(() => KdocEntity)
export class KdocResolver {
  constructor(private readonly kdocService: KdocService) {}

  @Query(() => PaginatedKdocResponse, {
    description: 'Получение справочника "Типы документов"',
  })
  getAllTypeDoc(
    @Args() args: GetKdocsArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderCatalogInput,
  ): Promise<PaginatedKdocResponse> {
    return this.kdocService.findAll(args, pagination, order);
  }

  @Query(() => [KdocEntity], {
    description: 'Получение справочника "Типы документов"',
  })
  getAllTypesDoc(): Promise<KdocEntity[]> {
    return this.kdocService.getAll();
  }

  // @Query(() => KdocEntity, {
  //   nullable: true,
  //   description: 'Получение записи справочника "Типы документов"',
  // })
  // getTypeDocById(
  //   @Args('id', { type: () => Int }) id: number,
  // ): Promise<KdocEntity> {
  //   return this.kdocService.findOne(id);
  // }

  @Query(() => [KdocEntity], {
    description: 'Получение справочника "Типы документов" для модуля проекты',
  })
  getAllTypeDocForProject(): Promise<KdocEntity[]> {
    return this.kdocService.getAllTypeDocForProject();
  }
}
