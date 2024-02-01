import { ArgsType, Field, Int, OmitType, PartialType } from "@nestjs/graphql";
import { DocPackageDeletedEntity } from "../../../entity/#organization/docPackageDeleted/docPackageDeleted.entity";

@ArgsType()
export class GetDocPackagesDeletedArgs extends PartialType(
  OmitType(DocPackageDeletedEntity, ["id"] as const),
) {
  @Field(() => [Int], { nullable: true, description: "Id дел." })
  ids?: number[];
}
