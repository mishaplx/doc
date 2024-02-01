import { Inject, Injectable, Scope } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";

import "dotenv/config";

import { CRON } from "../../../app.const";
import { SortEnum } from "../../../common/enum/enum";
import { customError } from "../../../common/type/errorHelper.type";
import { getDataSourceAdmin, getOrgList } from "../../../database/datasource/tenancy/tenancy.utils";
import { FileVersionEntity } from "../../../entity/#organization/file/fileVersion.entity";
import { PubSubService } from "../../../pubsub/pubsub.service";
import { FILE } from "../file.const";
import { getFileContent } from "../integration/file.integration.mainContent";
import { fileExists, getPathVolume, readFileVolume } from "../utils/file.volume.utils";
import { wLogger } from "../../logger/logging.module";

/********************************************
 * ИЗВЛЕЧЬ ТЕКСТ ИЗ ФАЙЛА
 ********************************************/
let blocked = false;
@Injectable({ scope: Scope.DEFAULT })
export class FileCronMainContentService {
  constructor(
    // @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
    @Inject(PubSubService) private readonly pubSub: PubSubService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CRON.FILE.MAIN_CONTENT.MASK, { name: CRON.FILE.MAIN_CONTENT.NAME })
  async execFileMainContent(): Promise<void> {
    // заблокировать повторный вход
    if (blocked) return;
    blocked = true;

    // CRON: остановить
    const cronJob = this.schedulerRegistry.getCronJob(CRON.FILE.MAIN_CONTENT.NAME);
    cronJob.stop();

    // если запуск заблокирован: выход без активации
    if (process.env.DISABLED_CRON === "true") return;

    try {
      const orgList = await getOrgList();
      for (const org of orgList) {
        try {
          // источник данных
          const dataSource = await getDataSourceAdmin(org);
          const fileVersionRepository = dataSource.getRepository(FileVersionEntity);

          // поочередная обработка записей FileVersionEntity с актуальными заданиями
          for (const fileVersionEntity of await fileVersionRepository.find({
            relations: { FileItems: true },
            where: { task_main_content: true, fail_main_content: false },
            order: { id: SortEnum.ASC },
          })) {
            // при отсутствии записи FileItem (еще не успели записать) - пропустить
            const fileItemEntity = fileVersionEntity.FileItemMain;
            if (fileItemEntity === undefined) continue;

            try {
              // путь к файлу
              const filePath = getPathVolume(
                org,
                fileItemEntity.date_create,
                fileItemEntity.volume,
              );

              // при отсутствии файла (FileItem есть) - ошибка
              if (!fileExists(filePath)) customError(`Файл не найден: fileItem.id=${fileItemEntity.id}`);

              // главный файл в поток
              const stream = await readFileVolume({
                filePath: filePath,
                compress: fileItemEntity.compress,
                isProxy: true,
                fileExtOrigin: "." + fileItemEntity.ext,
              });

              // ВЫПОЛНИТЬ ЗАДАЧУ: получить контент
              const content = await getFileContent({
                org: org,
                stream: stream,
              });

              // записать контент, сбросить признак задачи
              await fileVersionRepository.update(fileVersionEntity.id, {
                content: content,
                task_main_content: false,
                fail_main_content: false,
              });

              // при отсутствии контента - ошибка
              if (FILE.CONTENT.ERR_EMPTY && content == "") {
                customError("Отсутствует контент");
              }
            } catch (err) {
              wLogger.error(err);

              // отметить ошибку в БД
              await fileVersionRepository.update(fileVersionEntity.id, {
                fail_main_content: true,
              });

              // отправить уведомление пользователю
              await this.pubSub.pubWarning({
                org: org,
                emp_id: fileVersionEntity.emp_id,
                msg:
                  "Ошибка извлечения текста из файла: " +
                  fileVersionEntity.name +
                  "." +
                  fileItemEntity.ext +
                  " " +
                  "Содержимое файла не будет учитываться в поиске",
              });
              // await this.notifyOrgService.addNotify({
              //   notify_type_id: NotifyTypeEnum.SERVER_WARNING,
              //   emp_ids: [ fileVersionEntity.emp_id ],
              //   message:
              //     "Ошибка извлечения текста из файла: " +
              //     fileVersionEntity.name +
              //     "." +
              //     fileItemEntity.ext +
              //     " " +
              //     "Содержимое файла не будет учитываться в поиске",
              // kind: PsBaseEnum.warning,
              // });
            }
          }
        } catch (err) {
          wLogger.error(err);
        }
      }
    } finally {
      // CRON: запустить
      cronJob.start();
      blocked = false;
    }
  }
}
