import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { SmdoDocTypesEntity } from "../../entity/#organization/smdo/smdo_doc_types.entity";
import { DockTypesService } from "./dock-types.service";
@UseGuards(DeactivateGuard)
@Resolver(() => SmdoDocTypesEntity)
export class DockTypesResolver {
  constructor(private dockTypesService: DockTypesService) {}

  @Query(() => [SmdoDocTypesEntity], {
    description: "Справочники типов документов в СМДО",
  })
  async smdoDocTypes(): Promise<SmdoDocTypesEntity[]> {
    return this.dockTypesService.get();
  }
}
