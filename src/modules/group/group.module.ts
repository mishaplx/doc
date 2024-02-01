import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import GroupResolver from "./group.resolver";
import GroupService from "./group.service";

@Module({
  imports: [TenancyModule],
  providers: [GroupResolver, GroupService],
})
export class GroupModule {}
