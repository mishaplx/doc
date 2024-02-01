import { ObjectType } from "@nestjs/graphql";
import { TemplateContentEntity } from "../../../entity/#organization/templateContent/template_content.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedTemplateContentResponse extends PaginatedResponse(TemplateContentEntity) {}
