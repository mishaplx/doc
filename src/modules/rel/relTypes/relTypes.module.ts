import { Module } from "@nestjs/common";
import { TenancyModule } from "../../../database/datasource/tenancy/tenancy.module";
import { RelTypesResolver } from "./relTypes.resolver";
import { RelTypesService } from "./relTypes.service";

@Module({
  imports: [TenancyModule],
  providers: [RelTypesService, RelTypesResolver],
})
export class RelTypesModule {}
