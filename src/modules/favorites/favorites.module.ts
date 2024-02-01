import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { FavoritesResolver } from "./favorites.resolver";
import { FavoritesService } from "./favorites.service";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  providers: [FavoritesResolver, FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
