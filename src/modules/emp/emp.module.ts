import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { NotifyModule } from "../notify/notify.module";
import { EmpResolver } from "./emp.resolver";
import { EmpService } from "./emp.service";
import { EmpReplaceResolver } from "./empReplace/empReplace.resolver";
import { EmpReplaceService } from "./empReplace/empReplace.service";

@Module({
  imports: [TenancyModule, NotifyModule],
  providers: [EmpService, EmpResolver, EmpReplaceResolver, EmpReplaceService],
})
export class EmpModule {}
