import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { NumResolver } from "./crud/num/num.resolver";
import { NumService } from "./crud/num/num.service";
import { NumCountHistoryResolver } from "./crud/numCountHistory/numCountHistory.resolver";
import { NumCountHistoryService } from "./crud/numCountHistory/numCountHistory.service";
import { NumCountReserveResolver } from "./crud/numCountReverse/numCountReserve.resolver";
import { NumCountReserveService } from "./crud/numCountReverse/numCountReserve.service";
import { NumParamResolver } from "./crud/numParam/numParam.resolver";
import { NumParamService } from "./crud/numParam/numParam.service";
import { NumGenerateResolver } from "./generate/numGenerate.resolver";
import { NumGenerateService } from "./generate/numGenerate.service";
import { NumRegService } from "./reg/numReg.service";
import { NumRegResolver } from "./reg/numRes.resolver";
import { NumTickResolver } from "./tick/numTick.resolver";
import { NumTickService } from "./tick/numTick.service";

@Module({
  imports: [TenancyModule],
  providers: [
    NumRegResolver,
    NumRegService,
    NumService,
    NumResolver,
    NumParamResolver,
    NumParamService,
    NumCountHistoryService,
    NumCountHistoryResolver,
    NumCountReserveService,
    NumCountReserveResolver,
    NumTickService,
    NumTickResolver,
    NumGenerateService,
    NumGenerateResolver,
  ],
  exports: [NumRegService],
})
export class NumModule {}
