import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { SmdoSedListEntity } from "../../entity/#organization/smdo/smdo_sed_list.entity";
import { SedListService } from "./sed-list.service";
@UseGuards(DeactivateGuard)
@Resolver(() => SmdoSedListEntity)
export class SedListResolver {
  constructor(private sedListService: SedListService) {}

  @Query(() => [SmdoSedListEntity], {
    description: "Справочник организаций СЭД в СМДО",
  })
  async smdoSedList(): Promise<SmdoSedListEntity[]> {
    return this.sedListService.get();
  }
}
