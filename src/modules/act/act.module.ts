import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { ActResolver } from "./act.resolver";
import { ActService } from "./act.service";

@Module({
  imports: [TenancyModule],
  providers: [ActResolver, ActService],
})
export class ActModule {}
