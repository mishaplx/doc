import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { DocPackageStatusEntity } from "../../entity/#organization/docPackageStatus/docPackageStatus.entity";
import { DocPackageStatusService } from "./docPackageStatus.service";

@UseGuards(DeactivateGuard)
@Resolver(() => DocPackageStatusEntity)
export class DocPackageStatusResolver {
  constructor(private readonly docPackageStatusService: DocPackageStatusService) {}

  @Query(() => [DocPackageStatusEntity], {
    description: 'Получение справочника "Статусы дела"',
  })
  getAllDocPackageStatuses(): Promise<DocPackageStatusEntity[]> {
    return this.docPackageStatusService.findAll();
  }
}
