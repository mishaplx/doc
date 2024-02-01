import { ObjectType } from "@nestjs/graphql";
import { JobsControlTypesEntity } from "../../../../entity/#organization/job/jobControlTypes.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";

@ObjectType()
export class PaginatedCtrlResponse extends PaginatedResponse(JobsControlTypesEntity) {}
