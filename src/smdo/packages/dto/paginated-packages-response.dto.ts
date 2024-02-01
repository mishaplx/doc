import { ObjectType } from "@nestjs/graphql";
import { SmdoPackagesEntity } from "../../../entity/#organization/smdo/smdo_packages.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedPackagesResponse extends PaginatedResponse(SmdoPackagesEntity) {}
