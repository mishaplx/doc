import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { FavoritesModule } from "../favorites/favorites.module";
import { FavoritesService } from "../favorites/favorites.service";
import { NotifyModule } from "../notify/notify.module";
import { JobApprovResolver } from "./jobApprov/jobApprov.resolver";
import { JobApprovService } from "./jobApprov/jobApprov.service";
import { JobControlResolver } from "./jobControl/jobControl.resolver";
import { JobControlService } from "./jobControl/jobControl.service";
import { JobExecutorResolver } from "./jobExecutor/jobExecutor.resolver";
import { JobExecutorService } from "./jobExecutor/jobExecutor.service";
import { JobLoopResolver } from "./jobLoop/jobLoop.resolver";
import { JobLoopService } from "./jobLoop/jobLoop.service";
import { JobsResolver } from "./job.resolver";
import { JobsService } from "./job.service";
import { TypeJobResolver } from "./typeJob/typeJob.resolver";
import { TypeJobService } from "./typeJob/typeJob.service";

@Module({
  imports: [TenancyModule, NotifyModule, FavoritesModule],
  providers: [
    JobsResolver,
    JobsService,
    JobLoopResolver,
    JobLoopService,
    JobApprovResolver,
    JobApprovService,
    FavoritesService,
    JobExecutorResolver,
    JobExecutorService,
    JobControlService,
    JobControlResolver,
    TypeJobResolver,
    TypeJobService,
  ],
})
export class JobsModule {}
