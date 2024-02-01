import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { AuditController } from "./audit.controller";
import { AuditResolver } from "./audit.resolver";
import { AuditService } from "./audit.service";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  controllers: [AuditController],
  providers: [AuditResolver, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
