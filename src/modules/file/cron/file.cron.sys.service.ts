import { Inject, Injectable, Scope } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { LessThan } from "typeorm";

import { CONSOLE, CRON } from "src/app.const";
import { getDataSourceAdmin, getOrgList } from "src/database/datasource/tenancy/tenancy.utils";
import { PubSubService } from "src/pubsub/pubsub.service";
import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { getSettingsValInt } from "src/modules/settings/settings.util";
import { deleteFileVersionUtil } from "../fileDelete/fileDelete.utils";
import { wLogger } from "src/modules/logger/logging.module";
import { SETTING_CONST } from "src/modules/settings/settings.const";

/********************************************
 * РАБОТА С ФАЙЛАМИ: СИСТЕМНЫЕ ЗАДАЧИ
 ********************************************/
let blocked = false;
@Injectable({ scope: Scope.DEFAULT })
export class FileCronSysService {
  constructor(
    @Inject(PubSubService) private readonly pubSubService: PubSubService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CRON.FILE.SYS.MASK, { name: CRON.FILE.SYS.NAME })
  async execFileSys(): Promise<void> {
    // заблокировать повторный вход
    if (blocked) return;
    blocked = true;

    // CRON: остановить
    const cronJob = this.schedulerRegistry.getCronJob(CRON.FILE.SYS.NAME);
    cronJob.stop();

    // если запуск заблокирован: выход без активации
    if (process.env.DISABLED_CRON === "true") return;

    try {
      const orgList = await getOrgList();
      for (const org of orgList) {
        try {
          // источник данных
          const dataSource = await getDataSourceAdmin(org);

          /**
           * сессии: удалить старые версии файлов
           */
          const file_version_stage = getSettingsValInt({
            org: org,
            key: SETTING_CONST.FILE_VERSION_STAGE.nm,
          });
          if (file_version_stage > 0) {
            const dateVersionExp = new Date(new Date().getTime() - file_version_stage * 60 * 60 * 1000); // час. -> мсек.
            const version_list = await dataSource.manager.createQueryBuilder(FileItemEntity, "file_item")
              .innerJoin("file_item.FileVersion", "file_version")
              .innerJoin("file_version.FileBlock", "file_block", "file_block.file_version_main <> file_version.id")
              .select("file_version.id as id, file_version.emp_id as emp_id, file_version.version as version, file_version.name as name, file_item.ext as ext")
              .where({
                date_create: LessThan(dateVersionExp),
                main: true,
              })
              .getRawMany();
            for (const version of version_list) {
              await deleteFileVersionUtil({
                manager: dataSource.manager,
                idFileVersion: version.id,
              });
              await this.pubSubService.pubSys({
                org: org,
                emp_id: version.emp_id,
                msg: `По истечении времени хранения удалена версия [${version.version}] файла ${version.name}.${version.ext}`,
              });
            }
          }
        } catch (err) {
          wLogger.error(
            CONSOLE.COLOR.FG.RED + "База данных: " + org + CONSOLE.COLOR.RESET + "\n",
            err,
          );
        }
      }
    } finally {
      // CRON: запустить
      cronJob.start();
      blocked = false;
    }
  }
}
