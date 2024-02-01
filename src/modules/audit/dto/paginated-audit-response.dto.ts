import { ObjectType } from "@nestjs/graphql";
import { AuditEntity } from "../../../entity/#organization/audit/audit.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedAuditResponse extends PaginatedResponse(AuditEntity) {}
