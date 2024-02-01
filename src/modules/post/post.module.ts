import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { PostResolver } from "./post.resolver";
import { PostService } from "./post.service";

@Module({
  imports: [TenancyModule],
  providers: [PostResolver, PostService],
})
export class PostModule {}
