import { ObjectType } from "@nestjs/graphql";
import { ArticleEntity } from "../../../entity/#organization/article/article.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedArticleResponse extends PaginatedResponse(ArticleEntity) {}
