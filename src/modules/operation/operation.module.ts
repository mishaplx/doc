import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { OperationResolver } from "./operation.resolver";
import { OperationService } from "./operation.service";

@Module({
  imports: [TenancyModule],
  providers: [OperationResolver, OperationService],
})
export class OperationModule {}
