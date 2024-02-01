import { ObjectType } from "@nestjs/graphql";
import { JobEntity } from "../../../entity/#organization/job/job.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedJobResponse extends PaginatedResponse(JobEntity) {}
