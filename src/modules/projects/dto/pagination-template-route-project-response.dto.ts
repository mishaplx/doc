import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponse } from "../../../pagination/pagination.service";

import { TemplateRouteProjectEntity } from "../../../entity/#organization/templateRouteProject/template_route_project.entity";

@ObjectType()
export class PaginatedTempRouteProjectResponse extends PaginatedResponse(
  TemplateRouteProjectEntity,
) {}
