import { ObjectType } from "@nestjs/graphql";
import { OrgEntity } from "../../../entity/#organization/org/org.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedOrgResponse extends PaginatedResponse(OrgEntity) {}
