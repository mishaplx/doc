import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { SmdoPackagesEntity } from "../../entity/#organization/smdo/smdo_packages.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { GetPackagesArgs } from "./dto/get-packages.args";
import { OrderPackagesInput } from "./dto/order-packages-request.dto";
import { PaginatedPackagesResponse } from "./dto/paginated-packages-response.dto";
import { PackagesService } from "./packages.service";
@UseGuards(DeactivateGuard)
@Resolver(() => SmdoPackagesEntity)
export class PackagesResolver {
  constructor(private packageService: PackagesService) {}

  @Query(() => PaginatedPackagesResponse, {
    description: "Лог пакетов СМДО",
  })
  async smdoPackages(
    @Args() args: GetPackagesArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderPackagesInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedPackagesResponse> {
    return this.packageService.get(args, pagination, order, searchField);
  }

  @Query(() => Boolean, {
    description: "Повторное получение входящего пакета СМДО",
  })
  async smdoPackageRecieveAgain(@Args("packageId") packageId: string): Promise<boolean> {
    return this.packageService.deletePackageAndRefresh(packageId);
  }
}
