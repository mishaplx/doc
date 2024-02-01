import { HttpException, Inject, Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { DataSource, In, Repository } from "typeorm";

import { CRON } from "../../app.const";
import { customError, httpExceptErr } from "../../common/type/errorHelper.type";
import {
  globalSearchIncmailBuilderDoc,
  globalSearchProjectBuilderDoc,
  searchAllColumnWithoutRelation,
} from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { IncmailEntity } from "../../entity/#organization/inmail/incmail.entity";
import { LanguageEntity } from "../../entity/#organization/language/language.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { FileDeleteService } from "../file/fileDelete/fileDelete.service";
import { GetIncmailArgs } from "./dto/get-incmails.args";
import { ToDocIncmailInput } from "./dto/import-incmail.input";
import { OrderIncmailsInput } from "./dto/order-incmails-request.dto";
import { PaginatedIncmailResponse } from "./dto/paginated-incmails-response.dto";
import { setQueryBuilderIncmail } from "./utils/incmail.db.utils";
import { incmailDelete } from "./utils/incmail.delete.utils";
import { getMailsPOP3 } from "./utils/incmail.pop3";
import { getSettingsList } from "../settings/settings.util";

const EMAIL_PROTOKOL = "email.protokol";

@Injectable()
export class IncmailService {
  private readonly incmailRepository: Repository<IncmailEntity>;
  private readonly dataSource: DataSource;
  private readonly DELIVERY_EMAIL = 2;

  constructor(
    @Inject(DATA_SOURCE) dataSource: DataSource,
    @Inject(FileDeleteService)
    private readonly fileDeleteService: FileDeleteService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.dataSource = dataSource;
    this.incmailRepository = dataSource.getRepository(IncmailEntity);
  }

  /********************************************
   * ПОЧТОВЫЙ ИМПОРТ: НАЙТИ ПИСЬМО
   ********************************************/
  findOne(id: number): Promise<IncmailEntity> {
    return this.incmailRepository.findOne({ where: { id } });
  }

  /********************************************
   * ПОЧТОВЫЙ ИМПОРТ: НАЙТИ ПИСЬМА
   ********************************************/
  async findAll(
    args: GetIncmailArgs,
    pagination: PaginationInput,
    orderBy: OrderIncmailsInput,
    searchField: string,
  ): Promise<PaginatedIncmailResponse> {
    const queryBuilder = this.incmailRepository.createQueryBuilder("incmail");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchIncmailBuilderDoc(queryBuilder, searchField);
    } else {
      setQueryBuilderIncmail(args, orderBy, queryBuilder);
    }

    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [roles, total] = await queryBuilder.getManyAndCount();

    return paginatedResponseResult(roles, pageNumber, pageSize, total);
  }

  /********************************************
   * ПОЧТОВЫЙ ИМПОРТ: ИМПОРТИРОВАТЬ ПИСЬМА С ПОЧТОВЫХ СЕРВЕРОВ
   ********************************************/
  importIncmail(org: string): boolean {
    const data: Record<string, string> = getSettingsList({
      org: org,
      keys: [EMAIL_PROTOKOL],
    });

    const emailProtokol = data[EMAIL_PROTOKOL]?.toLowerCase();

    // IMAP
    if (emailProtokol === "imap") {
      setTimeout(() => this.schedulerRegistry.getCronJob(CRON.INCMAIL.NAME).fireOnTick(), 10);
      // POP3
    } else if (emailProtokol === "pop3") {
      getMailsPOP3(org)
        .then()
        .catch((e) => httpExceptErr(e.message));
    }
    return true;
  }

  /********************************************
   * ПОЧТОВЫЙ ИМПОРТ: ПЕРЕМЕСТИТЬ ПИСЬМО ВО ВХОДЯЩИЕ ДОКУМЕНТЫ
   ********************************************/
  async toDocIncmail(toDocIncmailInput: ToDocIncmailInput): Promise<boolean | HttpException> {
    return this.dataSource.transaction(async (manager) => {
      const incmails: IncmailEntity[] = await manager.findBy(IncmailEntity, {
        id: In(toDocIncmailInput.ids),
      });

      const defaultLanguages = await manager.findOne(LanguageEntity, {
        select: {
          id: true,
          nm: true,
        },
        where: {
          char_code_en: "rus",
        },
      });
      const defaultLanguage = [{ label: defaultLanguages.nm, id: defaultLanguages.id }];
      const dateImport = this.getDateImport();
      for (const incmail of incmails) {
        // документ: создать
        let docEntity = manager.create(DocEntity, {
          cls_id: toDocIncmailInput.cls,
          outd: incmail.dt,
          languages: defaultLanguage,
          delivery: this.DELIVERY_EMAIL,
          header: incmail.subject,
          nt: `От: ${incmail.sender}\nСодержание: ${incmail.body}\nДата импорта: ${dateImport}`,
          author: null,
        });
        docEntity = await manager.save(DocEntity, docEntity);

        // файлы: удалить ссылку на почтовый импорт, привязать к документу
        await manager.update(
          FileBlockEntity,
          { incmail_id: incmail.id },
          {
            doc_id: docEntity.id,
            incmail_id: null,
          },
        );

        // почтовый импорт: удалить
        await incmailDelete({
          manager: manager,
          incmail_ids: [incmail.id],
          delete_file: false,
        });
      }
      return true;
    });
  }

  /********************************************
   * ПОЧТОВЫЙ ИМПОРТ: УДАЛИТЬ ПИСЬМА
   * @param incmail_ids - id писем в почтовом импорте
   * @param delFile - удалять файлы-вложения
   ********************************************/
  incmailDelete = async (args: {
    incmail_ids: number[];
    delete_file?: boolean;
  }): Promise<boolean | HttpException> => {
    try {
      return this.dataSource.transaction(async (manager) => {
        return await incmailDelete({
          manager: manager,
          ...args,
        });
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  };

  /********************************************
   * Получить дату документа при импорте его из почтового импорта
   ********************************************/
  private getDateImport(): string {
    const date = new Date();
    const month = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    return `${date.getDate()}.${month}.${date.getFullYear()}`;
  }
}
