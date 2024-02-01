import { Module } from "@nestjs/common";
import { SettingsCronService } from "./cron/setttings.cron.service";
import { TenancyModule } from "src/database/datasource/tenancy/tenancy.module";
import { SystemSettingsService } from "./settings.service";
import { SystemSettingsResolver } from "./settings.resolver";

@Module({
  imports: [TenancyModule],
  providers: [
    SettingsCronService,
    SystemSettingsService,
    SystemSettingsResolver,
  ],
})
export class SettingsModule {}
