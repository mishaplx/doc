import { ObjectType } from "@nestjs/graphql";
import { IncmailEntity } from "../../../entity/#organization/inmail/incmail.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedIncmailResponse extends PaginatedResponse(IncmailEntity) {}
