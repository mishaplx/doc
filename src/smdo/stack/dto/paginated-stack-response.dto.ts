import { ObjectType } from "@nestjs/graphql";
import { SmdoStackEntity } from "../../../entity/#organization/smdo/smdo_stack.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedStackResponse extends PaginatedResponse(SmdoStackEntity) {}
