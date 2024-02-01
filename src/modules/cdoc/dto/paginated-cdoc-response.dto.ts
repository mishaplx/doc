import { ObjectType } from "@nestjs/graphql";
import { CdocEntity } from "../../../entity/#organization/doc/cdoc.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedCdocResponse extends PaginatedResponse(CdocEntity) {}
