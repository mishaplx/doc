import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { RoleResolver } from "./role.resolver";
import { RoleService } from "./role.service";

@Module({
  imports: [TenancyModule],
  providers: [RoleResolver, RoleService],
})
export class RoleModule {}
