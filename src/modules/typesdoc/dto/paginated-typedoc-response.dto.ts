import { ObjectType } from "@nestjs/graphql";
import { TdocEntity } from "../../../entity/#organization/doc/tdoc.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedTypedocResponseDto extends PaginatedResponse(TdocEntity) {}
