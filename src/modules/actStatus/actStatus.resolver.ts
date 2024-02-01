import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { ActStatusEntity } from "../../entity/#organization/actStatus/actStatus.entity";
import { ActStatusService } from "./actStatus.service";

@UseGuards(DeactivateGuard)
@Resolver(() => ActStatusEntity)
export class ACtStatusResolver {
  constructor(private readonly actStatusService: ActStatusService) {}

  @Query(() => [ActStatusEntity], {
    description: 'Получение справочника "Статусы акта"',
  })
  getAllActStatuses(): Promise<ActStatusEntity[]> {
    return this.actStatusService.findAll();
  }
}
