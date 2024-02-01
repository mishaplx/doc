import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { FavoritesService } from "../favorites/favorites.service";
import { FileModule } from "../file/file.module";
import { NotifyModule } from "../notify/notify.module";
import { ProjectsController } from "./projects.controller";
import { ProjectExecService } from "./projects.exec.service";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsService } from "./projects.service";
import { StageResolver } from "./stage/stage.resolver";
import { StageService } from "./stage/stage.service";
import { ProjectsTemplateResolver } from "./templateRouteProject/projectsTemplate.resolver";
import { ProjectsTemplateService } from "./templateRouteProject/projectsTemplate.service";

/**
 * Модуль для работы с проектами
 */

@Module({
  imports: [TenancyModule, FileModule, NotifyModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsResolver,
    ProjectsService,
    ProjectsTemplateResolver,
    ProjectsTemplateService,
    ProjectExecService,
    FavoritesService,
    StageResolver,
    StageService,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
