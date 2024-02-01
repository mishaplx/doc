import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { DeliveryEntity } from "../../entity/#organization/delivery/delivery.entity";
import { TypeSendService } from "./typeSend.service";
import { TypeSenderResolver } from "./typeSender.resolver";

@Module({
  imports: [TenancyModule],
  providers: [TypeSendService, TypeSenderResolver],
})
export class TypeSendModule {}
