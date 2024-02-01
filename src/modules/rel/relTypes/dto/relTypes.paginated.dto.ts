import { ObjectType } from "@nestjs/graphql";
import { RelTypesEntity } from "../../../../entity/#organization/rel/relTypes.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";

@ObjectType()
export class PaginatedRelTypesResponse extends PaginatedResponse(RelTypesEntity) {}
