import "dotenv/config";

import { Inject, Injectable, Scope } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";

import { CRON } from "../../../app.const";
import { SortEnum } from "../../../common/enum/enum";
import { customError } from "../../../common/type/errorHelper.type";
import { getDataSourceAdmin, getOrgList } from "../../../database/datasource/tenancy/tenancy.utils";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "../../../entity/#organization/file/fileVersion.entity";
import { PubSubService } from "../../../pubsub/pubsub.service";
import { FILE } from "../file.const";
import { getPdfFormat } from "../integration/file.integration.pdfFormat";
import { fileExists, getPathVolume, readFileVolume } from "../utils/file.volume.utils";
import { wLogger } from "src/modules/logger/logging.module";

/********************************************
 * ОПРЕДЕЛИТЬ ФОРМАТ PDF ФАЙЛА
 ********************************************/
let blocked = false;
@Injectable({ scope: Scope.DEFAULT })
export class FileCronPdfFormatService {
  constructor(
    @Inject(PubSubService) private readonly pubSub: PubSubService,
    // @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CRON.FILE.PDF_FORMAT.MASK, { name: CRON.FILE.PDF_FORMAT.NAME })
  async execFilePdfFormat(): Promise<void> {
    // заблокировать повторный вход
    if (blocked) return;
    blocked = true;

    // CRON: остановить
    const cronJob = this.schedulerRegistry.getCronJob(CRON.FILE.PDF_FORMAT.NAME);
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
          const fileItemRepository = dataSource.getRepository(FileItemEntity);

          const items = await fileItemRepository.find({
            relations: { FileVersion: true },
            where: {
              main: true,
              ext: "pdf",
              fail_pdf_format: false,
              task_pdf_format: true,
            },
            order: { id: SortEnum.ASC },
          });
          // поочередная обработка записей FileItemEntity с актуальными заданиями
          for (const fileItemEntity of items) {
            try {
              const fileVersionEntity = await fileItemEntity.FileVersion;

              let pdf_format = "";
              if (fileItemEntity.ext === "pdf") {
                // путь к файлу
                const filePath = getPathVolume(
                  org,
                  fileItemEntity.date_create,
                  fileItemEntity.volume,
                );

                // при отсутствии файла (FileItem есть) - ошибка
                // if (!fileExists(filePath)) continue;
                if (!fileExists(filePath)) customError("Файл не найден");

                // ВЫПОЛНИТЬ ЗАДАЧУ: определить формат pdf файла
                for (const fileFormatArjItem of FILE.FORMAT.ARJ) {
                  const fileStream = await readFileVolume({
                    filePath: filePath,
                    compress: fileItemEntity.compress,
                    isProxy: true,
                  });
                  if (
                    await getPdfFormat({
                        org: org,
                        stream: fileStream,
                        format: fileFormatArjItem,
                    })
                  ) {
                    pdf_format = fileFormatArjItem;
                    break;
                  }
                }
              }
              // if (pdf_format == '') pdf_format = FILE_FORMAT_PDF.FILE_FORMAT_PDF_UNDEFINED;

              // записать контент, сбросить признак задачи
              await fileItemRepository.update(fileItemEntity.id, {
                pdf_format: pdf_format,
                task_pdf_format: false,
                fail_pdf_format: false,
              });

              // если основной файл формата PDF, но не архивный - задача на создание PDF
              // if (fileItemEntity.ext === 'pdf' && pdf_format === FILE_FORMAT_PDF.FILE_FORMAT_PDF_UNDEFINED) {
              if (fileItemEntity.ext === "pdf" && pdf_format === "") {
                await fileVersionRepository.update(fileVersionEntity.id, {
                  task_pdf_create: true,
                });
              }

              // если зависимый файл и признак уведомления
              if (fileVersionEntity.notify_complete_depend) {
                // уведомление заинтересованным
                await this.pubSub.pubInfo({
                  org: org,
                  emp_id: fileVersionEntity.emp_id,
                  msg:
                    "Завершена подготовка файла:  " +
                    fileVersionEntity.name +
                    "." +
                    fileItemEntity.ext,
                });
                // await this.notifyOrgService.addNotify({
                //   notify_type_id: NotifyTypeEnum.SERVER_INFO,
                //   emp_ids: [ fileVersionEntity.emp_id ],
                //   message:
                //     "Завершена подготовка файла:  " +
                //     fileVersionEntity.name +
                //     "." +
                //     fileItemEntity.ext,
                // });
              }
            } catch (err) {
              wLogger.error(err);

              // отметить ошибку в БД
              await fileItemRepository.update(fileItemEntity.id, {
                fail_pdf_format: true,
              });

              // отправить уведомление пользователю
              const fileVersionEntity = await fileItemEntity.FileVersion;
              await this.pubSub.pubWarning({
                org: org,
                emp_id: fileVersionEntity.emp_id,
                msg:
                  "Ошибка определения типа PDF-файла: " +
                  fileVersionEntity.name +
                  "." +
                  fileItemEntity.ext,
              });
              // await this.notifyOrgService.addNotify({
              //   notify_type_id: NotifyTypeEnum.SERVER_ERROR,
              //   emp_ids: [ fileVersionEntity.emp_id ],
              //   message:
              //     "Ошибка определения типа PDF-файла: " +
              //     fileVersionEntity.name +
              //     "." +
              //     fileItemEntity.ext,
              //   kind: PsBaseEnum.error,
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
