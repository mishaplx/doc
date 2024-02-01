import { ObjectType } from "@nestjs/graphql";
import { DocPackageEntity } from "../../../entity/#organization/docPackage/docPackage.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedDocPackagesResponse extends PaginatedResponse(DocPackageEntity) {}
