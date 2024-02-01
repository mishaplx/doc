import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { DocPackageDeletedEntity } from "../../entity/#organization/docPackageDeleted/docPackageDeleted.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { DocPackageDeletedService } from "./docPackageDeleted.service";
import { GetDocPackagesDeletedArgs } from "./dto/get-doc-packages-deleted.args";
import { OrderDocPackagesDeletedInput } from "./dto/order-doc-packages-deleted-request.dto";
import { PaginatedDocPackagesDeletedResponse } from "./dto/paginated-doc-packages-deleted-response.dto";

@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => DocPackageDeletedEntity)
export class DocPackageDeletedResolver {
  constructor(private readonly docPackageDeletedService: DocPackageDeletedService) {}

  @Query(() => PaginatedDocPackagesDeletedResponse, {
    description: 'Получение справочника "Удалённые дела"',
  })
  getAllDocPackagesDeleted(
    @Args() args: GetDocPackagesDeletedArgs,
    @Args("pagination", {
      description: "Пагинация.",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderDocPackagesDeletedInput,
  ): Promise<PaginatedDocPackagesDeletedResponse> {
    return this.docPackageDeletedService.findAll(args, pagination, order);
  }
}
