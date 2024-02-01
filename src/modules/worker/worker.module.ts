import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { WorkerResolver } from "./worker.resolver";
import { WorkerService } from "./worker.service";

//Сотрудники организации
@Module({
  imports: [AuthModule, TenancyModule],
  providers: [WorkerResolver, WorkerService],
})
export class WorkerModule {}
