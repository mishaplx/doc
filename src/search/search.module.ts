import { Module } from "@nestjs/common";
import { TenancyModule } from "../database/datasource/tenancy/tenancy.module";
import { SearchResolver } from "./search.resolver";
import { SearchService } from "./search.service";

// полнотекствоый поиск
@Module({
  imports: [TenancyModule],
  providers: [SearchResolver, SearchService],
  exports: [SearchService],
})
export class SearchModule {}
