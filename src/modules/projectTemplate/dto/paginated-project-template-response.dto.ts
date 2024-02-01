import { ObjectType } from "@nestjs/graphql";

import { ProjectTemplateEntity } from "../../../entity/#organization/project_template/project_template.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedProjectTemplateResponse extends PaginatedResponse(ProjectTemplateEntity) {}
