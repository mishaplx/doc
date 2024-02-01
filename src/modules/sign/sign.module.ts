import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { SignCronVerifyService } from "./cron/sign.cron.verify.service";
import { SignCrudResolver } from "./crud/sign.crud.resolver";
import { SignCrudService } from "./crud/sign.crud.service";

@Module({
  imports: [TenancyModule],
  providers: [SignCrudResolver, SignCronVerifyService, SignCrudService],
  exports: [SignCronVerifyService],
})
export class SignModule {}
