import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { MenuOptionsResolver } from "./menuOptions.resolver";
import { MenuOptionsService } from "./menuOptions.service";

@Module({
  imports: [TenancyModule],
  providers: [MenuOptionsResolver, MenuOptionsService],
})
export class MenuOptionsModule {}
