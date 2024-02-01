import { ObjectType } from "@nestjs/graphql";
import { RolesEntity } from "../../../entity/#organization/role/role.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedRoleResponse extends PaginatedResponse(RolesEntity) {}
