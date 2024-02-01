import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { UserService } from "./user.service";
import { UsersResolver } from "./users.resolver";

@Module({
  imports: [TenancyModule],
  providers: [UserService, UsersResolver],
  exports: [UserService],
})
export class UserModel {}
