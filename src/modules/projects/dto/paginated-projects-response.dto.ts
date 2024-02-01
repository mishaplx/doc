import { ObjectType } from "@nestjs/graphql";
import { ProjectEntity } from "../../../entity/#organization/project/project.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedProjectsResponse extends PaginatedResponse(ProjectEntity) {}
