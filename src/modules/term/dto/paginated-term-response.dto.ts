import { ObjectType } from "@nestjs/graphql";
import { TermEntity } from "../../../entity/#organization/term/term.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedTermResponse extends PaginatedResponse(TermEntity) {}
