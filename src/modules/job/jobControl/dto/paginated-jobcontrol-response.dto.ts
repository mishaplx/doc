import { ObjectType } from "@nestjs/graphql";
import { JobControlEntity } from "../../../../entity/#organization/job/jobControl.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";

@ObjectType()
export class PaginatedJobControlResponse extends PaginatedResponse(JobControlEntity) {}
