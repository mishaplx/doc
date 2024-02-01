import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { NotifyResolver } from "./crud/notify/notify.resolver";
import { NotifyService } from "./crud/notify/notify.service";
import { NotifySubscribeResolver } from "./crud/notifySubscribe/notifySubscribe.resolver";
import { NotifySubscribeService } from "./crud/notifySubscribe/notifySubscribe.service";
import { NotifyTypeResolver } from "./crud/notifyType/notifyType.resolver";
import { NotifyTypeService } from "./crud/notifyType/notifyType.service";
import { NotifyOrgResolver } from "./org/notifyOrg.resolver";
import { NotifyOrgService } from "./org/notifyOrg.service";
import { NotifyOrgJobService } from "./org/notifyOrgJob.service";
import { NotifyOrgProjectService } from "./org/notifyOrgProject.service";

@Module({
  imports: [TenancyModule],
  providers: [
    NotifyResolver,
    NotifyService,
    NotifyTypeResolver,
    NotifyTypeService,
    NotifyResolver,
    NotifyService,
    NotifySubscribeResolver,
    NotifySubscribeService,
    NotifyOrgResolver,
    NotifyOrgService,
    NotifyOrgJobService,
    NotifyOrgProjectService,
  ],
  exports: [NotifyOrgService, NotifyOrgJobService, NotifyOrgProjectService],
})
export class NotifyModule {}
