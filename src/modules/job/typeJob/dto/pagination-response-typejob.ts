import { ObjectType } from "@nestjs/graphql";
import { TypeJobEntity } from "../../../../entity/#organization/typeJob/typeJob.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";

@ObjectType()
export class PaginatedTypeJobResponse extends PaginatedResponse(TypeJobEntity) {}
