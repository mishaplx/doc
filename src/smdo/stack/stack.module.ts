import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { StackResolver } from "./stack.resolver";
import { StackService } from "./stack.service";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  providers: [StackResolver, StackService],
  exports: [StackService],
})
export class StackModule {}
