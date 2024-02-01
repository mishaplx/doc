import { ObjectType } from "@nestjs/graphql";
import { DocPackageDeletedEntity } from "../../../entity/#organization/docPackageDeleted/docPackageDeleted.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedDocPackagesDeletedResponse extends PaginatedResponse(
  DocPackageDeletedEntity,
) {}
