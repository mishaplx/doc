import { ObjectType } from "@nestjs/graphql";
import { AuditOperationsEntity } from "src/entity/#organization/audit/audit-operations.entity";
import { PaginatedResponse } from "src/pagination/pagination.service";
import { AuditEntity } from "../../../entity/#organization/audit/audit.entity";

@ObjectType()
export class PaginatedAuditOperationsResponse extends PaginatedResponse(AuditOperationsEntity) {}
