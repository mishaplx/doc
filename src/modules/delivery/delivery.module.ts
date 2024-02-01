import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { DeliveryResolver } from "./delivery.resolver";
import { DeliveryService } from "./delivery.service";

@Module({
  imports: [TenancyModule],
  providers: [DeliveryResolver, DeliveryService],
})
export class DeliveryModule {}
