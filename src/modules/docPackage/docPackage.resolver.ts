import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Token } from "src/auth/decorator/token.decorator";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { DocPackageEntity } from "../../entity/#organization/docPackage/docPackage.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { DocPackageService } from "./docPackage.service";
import { GetDocPackagesArgs } from "./dto/get-doc-packages.args";
import { OrderDocPackagesInput } from "./dto/order-doc-packages-request.dto";
import { PaginatedDocPackagesResponse } from "./dto/paginated-doc-packages-response.dto";

@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => DocPackageEntity)
export class DocPackageResolver {
  constructor(private readonly docPackageService: DocPackageService) {}

  @Query(() => PaginatedDocPackagesResponse, {
    description: 'Получение справочника "Дела"',
  })
  getAllDocPackages(
    @Args() args: GetDocPackagesArgs,
    @Args("pagination", {
      description: "Пагинация.",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderDocPackagesInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedDocPackagesResponse> {
    return this.docPackageService.findAll(args, pagination, order, searchField);
  }

  @Mutation(() => Boolean, { description: "Сформировать внутреннюю опись" })
  formInnerInventoryDocPackages(
    @Args("ids", { type: () => [Int], description: "Id дел" }) ids: number[],
    @Token() token: IToken,
  ): Promise<boolean> {
    return this.docPackageService.formInnerInventory(ids, token);
  }

  @Mutation(() => Boolean, { description: "Подписать внутреннюю опись" })
  signInnerInventoryDocPackage(
    @Args("id", { type: () => Int, description: "Id дела" }) id: number,
    @Args("sign", { type: () => String, description: "ЭЦП в PEM-формате" }) sign: string,
    @Token() token: IToken,
  ): Promise<boolean> {
    return this.docPackageService.signInnerInventory(id, sign, token.current_emp_id);
  }
}
