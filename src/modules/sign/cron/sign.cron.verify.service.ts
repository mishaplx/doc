import "dotenv/config";

import { Inject, Injectable, Scope } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { EntityManager } from "typeorm";

import { CRON } from "../../../app.const";
import { SortEnum } from "../../../common/enum/enum";
import { customError, errWithoutPref } from "../../../common/type/errorHelper.type";
import { getDataSourceAdmin, getOrgList } from "../../../database/datasource/tenancy/tenancy.utils";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";
import { SignEntity } from "../../../entity/#organization/sign/sign.entity";
import { PubSubService } from "../../../pubsub/pubsub.service";
import { fileExists, getPathVolume, readFileVolume } from "../../file/utils/file.volume.utils";
import { IVerifySign, verifySign } from "../integration/sign.integration.verify";
import { wLogger } from "../../logger/logging.module";

/********************************************
 * ПРОВЕРИТЬ ЭЦП
 ********************************************/
let blocked = false;
@Injectable({ scope: Scope.DEFAULT })
export class SignCronVerifyService {
  constructor(
    @Inject(PubSubService) private readonly pubSubService: PubSubService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CRON.SIGN.MASK, { name: CRON.SIGN.NAME })
  async execSignVerify(): Promise<void> {
    // заблокировать повторный вход
    if (blocked) return;
    blocked = true;

    // CRON: остановить
    const cronJob = this.schedulerRegistry.getCronJob(CRON.SIGN.NAME);
    cronJob.stop();

    // если запуск заблокирован: выход без активации
    // В К Л Ю Ч И Т Ь
    // return;
    if (process.env.DISABLED_CRON === "true") return;

    try {
      const orgList = await getOrgList();
      for (const org of orgList) {
        try {
          // источник данных
          const dataSource = await getDataSourceAdmin(org);
          const signRepository = dataSource.getRepository(SignEntity);

          // поочередная обработка записей SignEntity с актуальными заданиями
          for (const signEntity of await signRepository.find({
            where: { task_verify: true, fail_verify: false },
            order: { id: SortEnum.ASC },
          })) {
            try {
              let ret: IVerifySign = undefined;
              await dataSource.transaction(async (manager) => {
                // проверить подпись файла
                if (signEntity.file_item_id) {
                  ret = await this.validFile({
                    org: org,
                    signEntity: signEntity,
                  });

                  // проверить подпись метаданных
                } else {
                  // ...
                }

                // сформировать данные для записи в БД
                const val = {
                  date_verify: new Date(),
                  valid: ret?.valid ?? false,
                  task_verify: false,
                  fail_verify: false,
                  error: ret?.error ?? "",
                };
                if (ret?.info) val["info"] = JSON.stringify(ret.info);

                // записать в БД: проверка пройдена, сбросить признак задачи
                await manager.update(SignEntity, { id: signEntity.id }, val);

                // сменить подписанта в доке
                if (ret?.info) await this.makeDocSigned(signEntity.file_item_id, ret.info, manager);
              });
            } catch (err) {
              // отметить ошибку в БД
              await signRepository.update(signEntity.id, {
                date_verify: new Date(),
                valid: false,
                fail_verify: true,
                // info: '',
                error: errWithoutPref(err.message),
              });

              // отправить уведомление пользователю
              await this.pubSubService.pubWarning({
                org: org,
                emp_id: signEntity.emp_id,
                msg: "Ошибка проверки подписи: id=" + signEntity.id,
              });
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

  async makeDocSigned(file_item_id, info, manager: EntityManager): Promise<void> {
    const fileInfo =
      await manager.query(`SELECT fblock.doc_id, fblock.job_id, fblock.project_id FROM sad.file_item fitem
    JOIN sad.file_version fversion on fitem.file_version_id = fversion.id
    JOIN sad.file_block fblock on fversion.file_block_id = fblock.id
    WHERE fitem.id = ${file_item_id}`);
    const fileInfoParsed = fileInfo[0];
    if (fileInfoParsed?.doc_id) {
      await manager.update(
        DocEntity,
        { id: fileInfoParsed.doc_id },
        { signed: `${info.surname} ${info.name}` },
      );
    }
  }

  /**
   * ПРОВЕРИТЬ ПОДПИСЬ ФАЙЛА
   */
  async validFile(args: {
    org: string;
    // manager: EntityManager,
    signEntity: SignEntity;
  }): Promise<IVerifySign> {
    const { org, signEntity } = args;

    // ссылка на подписанный файл
    const fileItemEntity = await signEntity.FileItem;

    // путь к файлу
    const filePath = getPathVolume(org, fileItemEntity.date_create, fileItemEntity.volume);

    // при отсутствии файла (FileItem есть) - ошибка
    if (!fileExists(filePath)) customError("Файл не найден");

    // файл в поток
    const file = await readFileVolume({
      filePath: filePath,
      compress: fileItemEntity.compress,
      isProxy: true,
    });

    // извлекать ли данные о подписанте
    const show_info = (signEntity?.info ?? "") == "";

    // проверить подпись
    return await verifySign({
      org: org,
      file: file,
      sign: signEntity.sign,
      show_info: show_info,
    });
  }
}
