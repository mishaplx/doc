import { ObjectType } from "@nestjs/graphql";
import { KdocEntity } from "../../../entity/#organization/doc/kdoc.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedKdocResponse extends PaginatedResponse(KdocEntity) {}
