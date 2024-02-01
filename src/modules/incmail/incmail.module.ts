import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { FileModule } from "../file/file.module";
import { UserModel } from "../user/users.module";
import { IncmailCronImportService } from "./cron/incmail.cron.import";
import { IncmailResolver } from "./incmail.resolver";
import { IncmailService } from "./incmail.service";

@Module({
  imports: [FileModule, UserModel, TenancyModule],
  providers: [IncmailService, IncmailResolver, IncmailCronImportService],
  exports: [IncmailCronImportService],
})
export class IncmailModule {}
