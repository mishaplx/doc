import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { RlsAccessEmpResolver } from "./crud/accessEmp/rlsAccessEmp.resolver";
import { RlsAccessEmpService } from "./crud/accessEmp/rlsAccessEmp.service";
import { RlsAccessGroupResolver } from "./crud/accessGroup/rlsAccessGroup.resolver";
import { RlsAccessGroupService } from "./crud/accessGroup/rlsAccessGroup.service";
import { RlsGroupResolver } from "./crud/group/rlsGroup.resolver";
import { RlsGroupService } from "./crud/group/rlsGroup.service";

@Module({
  imports: [TenancyModule],
  providers: [
    RlsGroupResolver,
    RlsGroupService,
    RlsAccessEmpResolver,
    RlsAccessEmpService,
    RlsAccessGroupResolver,
    RlsAccessGroupService,
  ],
  exports: [],
})
export class RlsModule {}
