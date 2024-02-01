import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { ReceiverResolver } from "./receiver.resolver";
import { ReceiverService } from "./receiver.service";

@Module({
  imports: [TenancyModule],
  providers: [ReceiverService, ReceiverResolver],
})
export class ReceiverModule {}
