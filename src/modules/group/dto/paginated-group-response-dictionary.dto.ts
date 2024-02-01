import { ObjectType } from "@nestjs/graphql";
import { GroupingEntity } from "../../../entity/#organization/grouping/grouping.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedGroupResponseDictionary extends PaginatedResponse(GroupingEntity) {}
