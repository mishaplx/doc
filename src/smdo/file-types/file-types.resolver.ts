import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { SmdoFileTypesEntity } from "../../entity/#organization/smdo/smdo_file_types.entity";
import { FileTypesService } from "./file-types.service";
@UseGuards(DeactivateGuard)
@Resolver(() => SmdoFileTypesEntity)
export class FileTypesResolver {
  constructor(private fileTypesService: FileTypesService) {}

  @Query(() => [SmdoFileTypesEntity], {
    description: "Справочники типов файлов в СМДО",
  })
  async smdoFileTypes(): Promise<SmdoFileTypesEntity[]> {
    return this.fileTypesService.get();
  }
}
