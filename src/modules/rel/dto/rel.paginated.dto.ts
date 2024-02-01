import { ObjectType } from "@nestjs/graphql";
import { RelEntity } from "../../../entity/#organization/rel/rel.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedRelResponse extends PaginatedResponse(RelEntity) {}
