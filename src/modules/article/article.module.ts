import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { ArticleResolver } from "./article.resolver";
import { ArticleService } from "./article.service";

@Module({
  imports: [TenancyModule],
  providers: [ArticleService, ArticleResolver],
})
export class ArticleModule {}
