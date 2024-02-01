import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { OrderCatalogInput } from "../common/argsType/order-catalog-request.dto";
import { defaultPaginationValues, PaginationInput } from "../pagination/paginationDTO";
import { AdminService } from "./admin.service";
import { inputAdminDto, responseAdmin, responseAdminApi } from "./dto/admin.dto";
import { GetAdminPanelArgs, PaginatedAdminPanelResponse } from "./dto/get-pagination-admin.dto";

@Resolver(() => responseAdmin)
export class AdminResolver {
  constructor(private adminService: AdminService) {}
  @Mutation(() => responseAdmin)
  createNewOrganization(@Args("body") body: inputAdminDto): Promise<responseAdminApi> {
    return this.adminService.createOrganization(body);
  }

  // @Mutation(() => Boolean)
  // updateAllOrganization(): Promise<boolean> {
  //   return this.adminService.updateAllOrganization();
  // }

  @Mutation(() => Boolean)
  updateOrganization(
    @Args("organization", { type: () => String }) organization: string,
  ): Promise<boolean> {
    return this.adminService.updateOrganization(organization);
  }

  @Mutation(() => Boolean)
  deactivateOrganization(@Args("id", { type: () => Number }) id: number): Promise<void> {
    return this.adminService.deactivateOrganization(id);
  }

  @Mutation(() => Boolean)
  activateOrganization(
    @Args("id", { type: () => Number }) id: number,
    @Args("date_activated", { type: () => Date }) date_activated: Date,
  ): Promise<void> {
    return this.adminService.activateOrganization(id, date_activated);
  }

  @Query(() => PaginatedAdminPanelResponse)
  getOrganizations(
    @Args() args: GetAdminPanelArgs,
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
  ): Promise<PaginatedAdminPanelResponse> {
    return this.adminService.getOrganizations(args, pagination, order);
  }
}
