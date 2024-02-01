import "dotenv/config";

import { Inject, Injectable, Scope } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { Worker } from "worker_threads";
import path from "path";
import semaphore from "semaphore";

import { CRON } from "../../../app.const";
import { SortEnum } from "../../../common/enum/enum";
import { wLogger } from "../../logger/logging.module";
import { getDataSourceAdmin, getOrgList } from "../../../database/datasource/tenancy/tenancy.utils";
import { FileVersionEntity } from "../../../entity/#organization/file/fileVersion.entity";
import { PubSubService } from "../../../pubsub/pubsub.service";

/********************************************
 * СОЗДАТЬ PDF ФАЙЛ
 * compress также как и у main
 ********************************************/
let blocked = false;
@Injectable({ scope: Scope.DEFAULT })
export class FileCronPdfCreateService {
  private workerPool: Worker[] = [];
  private taskSemaphore: any;
  private processedTaskIds: Set<number> = new Set();

  constructor(
    @Inject(PubSubService) private readonly pubSub: PubSubService,
    // @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
    //@Inject(FileDeleteService) private readonly fileDeleteService: FileDeleteService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.taskSemaphore = semaphore(5);
  }

  async errorPdfPub(fileVersionEntity, org): Promise<void> {
    this.pubSub.pubWarning({
      org: org,
      emp_id: fileVersionEntity.emp_id,
      msg: "Ошибка создания PDF-файла: " + fileVersionEntity.name + ".pdf",
    });
  }

  async successPdfPub(fileVersionEntity, org): Promise<void> {
    this.pubSub.pubInfo({
      org: org,
      emp_id: fileVersionEntity.emp_id,
      msg: "Создан PDF-файл:  " + fileVersionEntity.name + ".pdf",
    });
  }

  async createAndInitWorker(org, fileVersionEntity): Promise<void> {
    try {
      if (this.processedTaskIds.has(fileVersionEntity.id)) {
        return;
      }
      this.taskSemaphore.take(async () => {
        const worker = new Worker(path.resolve(__dirname, "./pdfCreateWorker.js"), {
          workerData: {
            org: org,
            fileVersionEntity: fileVersionEntity,
            url: global.settings[org].URL_PDF_CREATE,
            timeout: global.settings[org].TIMEOUT_PDF_CREATE,
          }
        });

        this.processedTaskIds.add(fileVersionEntity.id);

        worker.on("error", (error) => {
          this.errorPdfPub(fileVersionEntity, org);
          this.processedTaskIds.delete(fileVersionEntity.id);
          wLogger.error("Worker Error:", error);
        });

        worker.on("message", (message) => {
          if (message) this.successPdfPub(fileVersionEntity, org);
          else this.errorPdfPub(fileVersionEntity, org);
          this.processedTaskIds.delete(fileVersionEntity.id);
          this.taskSemaphore.leave();
        });

        this.workerPool.push(worker);
      });
    } catch (e) {
      wLogger.info(e);
    }
  }

  @Cron(CRON.FILE.PDF_CREATE.MASK, { name: CRON.FILE.PDF_CREATE.NAME })
  async execFilePdfCreate(): Promise<void> {
    // заблокировать повторный вход
    if (blocked) return;
    blocked = true;

    // CRON: остановить
    const cronJob = this.schedulerRegistry.getCronJob(CRON.FILE.PDF_CREATE.NAME);
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
          const tasks = await fileVersionRepository.find({
            relations: { FileItems: true },
            where: { task_pdf_create: true, fail_pdf_create: false },
            order: { id: SortEnum.ASC },
          });
          //  wLogger.info(tasks.length, 'количество задач на конвертацию');
          if (tasks.length > 0) {
            const promises = tasks.map((fileVersionEntity) =>
              this.createAndInitWorker(org, fileVersionEntity),
            );
            await Promise.all(promises);
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
