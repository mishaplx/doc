import { ObjectType } from "@nestjs/graphql";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedDocResponse extends PaginatedResponse(DocEntity) {}
