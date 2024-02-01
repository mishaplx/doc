import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import Excel from "exceljs";
import { Request } from "express";
import { constants } from "fs";
import fs from "fs/promises";
import path from "path";
import process from "process";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { getDataSourceAdmin } from "src/database/datasource/tenancy/tenancy.utils";
import { deliveryArr } from "src/database/seed/data/default/doc/delivery";
import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { DataSource, In, QueryRunner, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { CdocEntity } from "../../entity/#organization/doc/cdoc.entity";

import { ActionsDoc } from "../../BACK_SYNC_FRONT/actions/actions.doc";
import { DocPackageStatus, FORWARDING_STATUS, PREF_ERR } from "../../common/enum/enum";
import { IAttachmentsForSendMail } from "../../common/interfaces/doc.interface";
import { customError, setErrorGQL, validError } from "../../common/type/errorHelper.type";
import { DocInput } from "../../common/type/FindAllDocType.type";
import { globalSearchDocBuilderDoc } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { CitizenEntity } from "../../entity/#organization/citizen/citizen.entity";
import { CorrespondentEntity } from "../../entity/#organization/correspondent/correspondent.entity";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { DocPackageEntity } from "../../entity/#organization/docPackage/docPackage.entity";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { ForwardingEntity } from "../../entity/#organization/forwarding/forwarding.entity";
import { JobEntity } from "../../entity/#organization/job/job.entity";
import { LanguageEntity } from "../../entity/#organization/language/language.entity";
import { NomenclaturesEntity } from "../../entity/#organization/nomenclatures/nomenclatures.entity";
import { OrgEntity } from "../../entity/#organization/org/org.entity";
import { PrivEntity } from "../../entity/#organization/priv/priv.entity";
import { SmdoPackagesEntity } from "../../entity/#organization/smdo/smdo_packages.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { SmdoService } from "../../smdo/smdo.service";
import { getAccessEnablingDoc } from "../access/accessEnabling/accessEnabling.doc";
import { AccessDoc } from "../access/accessValid/doc/accessValid.doc";
import { deleteInnerInventoryDocPackage } from "../docPackage/docPackage.utils";
import { FavoritesService } from "../favorites/favorites.service";
import { fileDBListBlock } from "../file/utils/db/file.db.list.utils";
import { createPath, getPathVolumeEntity } from "../file/utils/file.volume.utils";
import Logger from "../logger/logger";
import { wLogger } from "../logger/logging.module";
import { NumRegService } from "../num/reg/numReg.service";
import { ReportWordDocService } from "../report/word/doc/reportWordDoc.service";
import { DeliveryEnum, DocStatus, DocumentTypes, KDOC_ID } from "./doc.const";
import { bodyDownloadBookDTO } from "./dto/bodyDownloadBook.dto";
import { GetDocumentsArgs } from "./dto/get-documents.args";
import { OrderDocInput } from "./dto/order-doc-request.dto";
import { PaginatedDocResponse } from "./dto/paginated-documents-response.dto";
import {
  excludeDocsFromDocPackage,
  getCurrentUnitCode,
  sendMail,
  setQueryBuilderDoc,
} from "./utils/doc.utils";

@Injectable()
export class DocService {
  public docRepository: Repository<DocEntity>;
  public ForwardRepository: Repository<ForwardingEntity>;
  public JobRepository: Repository<JobEntity>;
  public nomenclaturesRepository: Repository<NomenclaturesEntity>;
  public privRepository: Repository<PrivEntity>;
  private readonly docPackageRepository: Repository<DocPackageEntity>;
  private readonly languageRepository: Repository<LanguageEntity>;
  private readonly CorrespondenRepository: Repository<CorrespondentEntity>;
  private readonly fileRepository: Repository<FileItemEntity>;
  private readonly cdocRepository: Repository<CdocEntity>;
  private readonly DEVIVERY_MAIN = 2;
  private readonly ERR_MSG_DOC_NOT_FOUND = "Документ не найден";
  private readonly ERR_MSG_DOC_PACKAGE_NOT_FOUND = "Дело не найдено";
  private readonly ERR_MSG_DOC_STATUS = "Недопустимый статус документа";
  public readonly accessDoc: AccessDoc;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private reportWordDocService: ReportWordDocService,
    private numRegService: NumRegService,
    private FavoritesService: FavoritesService,
    private logger: Logger,
  ) {
    this.docRepository = dataSource.getRepository(DocEntity);
    this.languageRepository = dataSource.getRepository(LanguageEntity);
    this.nomenclaturesRepository = dataSource.getRepository(NomenclaturesEntity);
    this.privRepository = dataSource.getRepository(PrivEntity);
    this.JobRepository = dataSource.getRepository(JobEntity);
    this.ForwardRepository = dataSource.getRepository(ForwardingEntity);
    this.docPackageRepository = dataSource.getRepository(DocPackageEntity);
    this.CorrespondenRepository = dataSource.getRepository(CorrespondentEntity);
    this.fileRepository = dataSource.getRepository(FileItemEntity);
    this.cdocRepository = dataSource.getRepository(CdocEntity);

    this.accessDoc = new AccessDoc(dataSource);
  }

  async getAllDoc(
    args: GetDocumentsArgs,
    userId: number,
    pagination: PaginationInput,
    orderBy: OrderDocInput,
    searchField: string,
  ): Promise<PaginatedDocResponse> {
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchDocBuilderDoc(queryBuilder, searchField, args);
    } else {
      setQueryBuilderDoc(args, orderBy, userId, queryBuilder);

      if (!All) {
        queryBuilder.skip((pageNumber - 1) * pageSize);
        queryBuilder.take(pageSize);
      }
    }

    const [docs, total] = await queryBuilder.getManyAndCount();
    return paginatedResponseResult(docs, pageNumber, pageSize, total);
  }

  /**
   * ДОКУМЕНТ: ПРОЧИТАТЬ
   */
  async FindByIdDoc(id: number, token: IToken): Promise<DocEntity | any> {
    try {
      const docEntity = await this.docRepository.findOne({
        relations: {
          FileBlock: {
            FileVersions: {
              FileItems: true,
            },
          },
          DocPackageTemp: {
            Nomenclature: {
              MainParent: true,
            },
          },
        },
        where: { id: id, del: false },
      });
      const forward = await this.ForwardRepository.find({
        where: {
          emp_receiver: token.current_emp_id,
          id_doc: id,
          status_id: FORWARDING_STATUS.STATUS_NOT_VEIW.id,
        },
      });
      if (forward.length !== 0) {
        await this.ForwardRepository.update(
          { id: forward[0].id },
          {
            status_id: FORWARDING_STATUS.STATUS_VEIW.id,
          },
        );
      }

      // ДОСТУПНЫЕ ОПЕРАЦИИ
      docEntity.EnablingActions = await getAccessEnablingDoc({
        emp_id: token.current_emp_id,
        docEntity: docEntity,
      });
      docEntity.isFavorites = await this.FavoritesService.isFavorite(token, docEntity.id);
      // DB-503
      return await getCurrentUnitCode(docEntity);
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async createDoc(cls: number, author_id): Promise<DocEntity> {
    try {
      const defaultLanguages = await this.languageRepository.findOne({
        select: {
          id: true,
          nm: true,
        },
        where: {
          char_code_en: "rus",
        },
      });
      const newDoc = this.docRepository.create({
        temp: true,
        author: author_id,
        del: false,
        docstatus: DocStatus.NEWDOC.id,
        languages: [{ label: defaultLanguages.nm, id: defaultLanguages.id }],
        cls_id: cls,
      });
      const { id } = await this.docRepository.save(newDoc);

      return await this.docRepository.findOneBy({ id: id });
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }


  /**
   * @param regNumIs (boolean) - использовать нумератор (счетчик)
   * @param ignore_unique (boolean) - игнорировать уникальность комбинации (дата регистрации, номер и тип документа)
   * при регистрации документа
   *
   * регистрационный номер может быть сгенерирован (regNumIs=true), но не использован (если задан docItem.reg_num)
   */
  async updateDoc(
    auto_num: boolean,
    nomenclature_division: number,
    nomenclature_index: number,
    docItem: DocInput,
    regNumIs: boolean,
    ignore_unique: boolean,
    flagButton: number,
    token: IToken,
    req: Request,
  ): Promise<DocEntity | HttpException> {
    try {
      docItem.body = docItem.header; //костыль специально для белаза!!!
      const docEntity = await this.docRepository.findOne({
        where: {
          id: docItem.id,
        },
      });
      const { cls_id, docstatus, author } = docEntity;
      // удалить null поля (т.к. фронт присылает все поля, в т.ч. с не установленным значением)
      // for (const key in docItem) {
      //     if (docItem.hasOwnProperty(key) && docItem[key] == null) {
      //         delete docItem[key];
      //     }
      // }

      // "удаление" записи
      if (docItem.del === true) {
        // доступность операции
        await this.accessDoc.valid({
          emp_id: token.current_emp_id,
          actions: [ActionsDoc.DOC_DEL],
          args_parsed: {
            doc: [docEntity],
          },
        });
        await this.dataSource.transaction(async (manager) => {
          // обновить запись для установки признака ее удаления
          await manager.update(DocEntity, { id: docItem.id }, docItem);
          await this.logger.customLog(
            token,
            "deleteDoc",
            "Удаление документа",
            `ID документа: ${docItem.id}`,
            req,
            manager,
          );
          if (docEntity.delivery == DeliveryEnum.SMDO) {
            // Получить пакет СМДО
            const smdoPackage = await manager.findOneOrFail(SmdoPackagesEntity, {
              where: { docId: docItem.id },
            });
            this.logger.customLog(
              token,
              "smdoRegisterReject",
              "Отказ в регистрации",
              `ID документа: ${docItem.id}`,
              req,
              manager,
            );
            // Отправить квитанцию об отказе регистрации в СМДО
            await new SmdoService(this.dataSource).sendAcknowledge(
              smdoPackage.smdoId,
              "REJECT",
              manager,
            );
          }
        });
        return await this.docRepository.findOneByOrFail({ id: docItem.id });
      }

      // проверка на корректность id дела
      if (docItem.doc_package_temp_id) {
        const isDocPackage = await this.docPackageRepository.countBy({
          id: docItem.doc_package_temp_id,
          del: false,
        });
        if (!isDocPackage) {
          customError(this.ERR_MSG_DOC_PACKAGE_NOT_FOUND);
        }
      }

      switch (cls_id) {
        case DocumentTypes.INNER: //внутренний
          break;
        case DocumentTypes.OUTCOME: // исходящий
          break;
        case DocumentTypes.INCOME: // входящий
          if (author === null) {
            docItem.author = token.current_emp_id;
          }
          break;
        case DocumentTypes.APPEAL: // обращение
          break;
      }

      switch (flagButton) {
        case 1: // ACTION: СОХРАНИТЬ
          await this.saveDoc(docstatus, docItem, token, flagButton);
          await this.logger.customLog(
            token,
            "saveDoc",
            "Сохранение документа",
            `ID документа: ${docItem.id}`,
            req,
            this.dataSource.manager,
          );
          //console.log(docItem,'savw');
          break;

        case 2: // ACTION: ЗАРЕГИСТРИРОВАТЬ
          const regNumCustom = docItem.reg_num;
          docItem.reg_num = null;
          await this.saveDoc(docstatus, docItem, token, flagButton);

          const document = await this.docRepository.findOne({
            where: {
              id: docItem.id,
            },
          });
          if (docItem.isorg) {
            //  const correspondent = await documnet.Correspondent
            docItem.org_id = document.org_id;
          } else {
            docItem.citizen_id = document.citizen_id;
          }

          await this.docRepository.update({ id: docItem.id }, docItem);
          const ret = await this.numRegService.regDoc({
            emp_id: token.current_emp_id,
            doc_id: docItem.id,
            reg_num_is: regNumIs,
            reg_num_custom: regNumCustom,
            ignore_unique: ignore_unique,
          });
          await this.logger.customLog(
            token,
            "registerDoc",
            "Регистрация документа",
            `ID документа: ${docItem.id}`,
            req,
            this.dataSource.manager,
          );

          validError(ret, "Ошибка нумератора");
          break;
        case 3: // НЕ ПОДЛЕЖИТ РЕГИСТРАЦИИИ
          const doc = await this.docRepository.findOne({
            where: {
              id: docItem.id,
            },
          });
          if (
            (doc.docstatus !== DocStatus.NEWDOC.id ||
              doc.docstatus !== DocStatus.INREGISTRATE.id) &&
            doc.delivery !== deliveryArr.filter((el) => el.nm === "СМДО")[0].id
          ) {
            return setErrorGQL("Ошибка обновления документа");
          } else {
            await this.dataSource.transaction(async (manager) => {
              if (docEntity.delivery == DeliveryEnum.SMDO) {
                await manager.update(
                  DocEntity,
                  { id: docItem.id },
                  { docstatus: DocStatus.NOTREGISTER.id },
                );
                // Получить пакет СМДО
                const smdoPackage = await manager.findOneOrFail(SmdoPackagesEntity, {
                  where: { docId: docItem.id },
                });
                // Отправить квитанцию: не подлежит регистрации в СМДО
                await new SmdoService(this.dataSource).sendAcknowledge(
                  smdoPackage.smdoId,
                  "DECLINE",
                  manager,
                );
                await this.logger.customLog(
                  token,
                  "smdoDecline",
                  "Не подлежит регистрации",
                  `ID документа: ${docItem.id}`,
                  req,
                  manager,
                );
              }
            });
          }
          break;
        default:
          break;
      }

      return await this.docRepository.findOneByOrFail({ id: docItem.id });
    } catch (err) {
      return customError("Ошибка обновления документа", err);
    }
  }

  getAllPriv(): Promise<PrivEntity[]> {
    return this.privRepository.find({
      order: { nm: "ASC" },
    });
  }

  async saveDoc(docstatus, docItem, token, flagButton) {
    if (docstatus == DocStatus.NEWDOC.id) {
      docItem.docstatus = DocStatus.INREGISTRATE.id;
    }
    if (docItem.delivery === this.DEVIVERY_MAIN) {
      docItem.exec = token.current_emp_id;
    }
    docItem.temp = false;

    if (docItem.cdoc) {
      const isCdoc = await this.cdocRepository.findOneBy({
        id: docItem.cdoc,
      });
      if (!isCdoc) customError("Класс документа не найден");
    }
    await this.docRepository.update({ id: docItem.id }, docItem);
    const fromWh = await this.CorrespondenRepository.findOne({
      where: {
        doc_id: docItem.id,
      },
    });
    if (docItem.org_id) {
      if (fromWh) {
        await this.CorrespondenRepository.update(
          { doc_id: docItem.id },
          {
            org: docItem.org_id,
            citizen_id: null,
          },
        );
      } else {
        await this.CorrespondenRepository.save({
          doc_id: docItem.id,
          org: docItem.org_id,
          citizen_id: null,
          outd: docItem.outd,
          emp_id_author: docItem.author,
        });
        await this.docRepository.update(
          { id: docItem.id },
          {
            citizen_id: null,
          },
        );
      }
    }
    if (docItem.citizen_id) {
      if (fromWh) {
        await this.CorrespondenRepository.update(
          { doc_id: docItem.id },
          {
            citizen_id: docItem.citizen_id,
            org: null,
          },
        );
      } else {
        await this.CorrespondenRepository.save({
          doc_id: docItem.id,
          org: null,
          citizen_id: docItem.citizen_id,
          outd: docItem.outd,
          emp_id_author: docItem.author,
        });
        await this.docRepository.update({ id: docItem.id }, { org_id: null });
      }
    }
    let dublicate = 0;
    if (flagButton === 2) {
      dublicate = await this.checkDublicateDocRegistrate(docItem);
    }

    const document = await this.docRepository.findOneByOrFail({ id: docItem.id });
    return {
      dublicate,
      document,
    };
  }

  /**
   * Получение максимального порядкового номера документа в деле
   */
  private async getMaxSerialNumber(docPackageId: number): Promise<number> {
    const { maxSerialNumber } = await this.docRepository
      .createQueryBuilder("")
      .select("COALESCE(MAX(serial_number)::int, 0)", "maxSerialNumber")
      .where({ doc_package_id: docPackageId, del: false, temp: false })
      .getRawOne();

    return maxSerialNumber;
  }

  async sendDocToDocPackage(
    token: IToken,
    docId: number,
    docPackageId: number,
    fileIds: number[],
  ): Promise<boolean> {
    const doc = await this.docRepository.findOneBy({
      id: docId,
      del: false,
      temp: false,
    });

    if (!doc) {
      customError(this.ERR_MSG_DOC_NOT_FOUND);
    }

    // Допустимый статус для входящих и внутренних - Исполнено
    if ([DocumentTypes.INCOME, DocumentTypes.INNER].includes(doc.cls_id)) {
      if (doc.docstatus !== DocStatus.DONE.id) {
        customError(this.ERR_MSG_DOC_STATUS);
      }
    }

    // Допустимый статус для исходящих - Зарегистрирован
    if (DocumentTypes.OUTCOME === doc.cls_id && doc.docstatus !== DocStatus.REGISTRATE.id) {
      customError(this.ERR_MSG_DOC_STATUS);
    }

    if (!docPackageId && !doc.doc_package_temp_id) {
      customError("Временное дело отсутствует");
    }

    const docPackageTempId = docPackageId ?? doc.doc_package_temp_id;

    const docPackage = await this.docPackageRepository.findOneBy({
      id: docPackageTempId,
      del: false,
    });

    if (!docPackage) {
      customError(this.ERR_MSG_DOC_PACKAGE_NOT_FOUND);
    }

    // Нельзя добавить документ в дело, если это дело включено в опись или в акт
    if (
      [DocPackageStatus.INCLUDED_IN_INVENTORY, DocPackageStatus.INCLUDED_IN_ACT].includes(
        docPackage.status_id,
      )
    ) {
      customError("Недопустимый статус дела");
    }

    const countValidFiles = await this.fileRepository.countBy({
      FileVersion: { FileBlock: { doc_id: docId } },
      id: In(fileIds),
    });

    if (countValidFiles !== fileIds.length) {
      customError("Недопустимые файлы");
    }

    const isRkk = await this.fileRepository.countBy({
      FileVersion: { FileBlock: { doc_id: docId, rkk: true } },
      id: In(fileIds),
    });

    if (isRkk) {
      customError("Ркк нельзя передавать");
    }

    const dataSource = await getDataSourceAdmin(token.url);
    const queryRunner: QueryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Получаем крайний порядковый номер документов
      const lastSerialNumber = await this.getMaxSerialNumber(docPackageTempId);

      await queryRunner.manager.update(DocEntity, docId, {
        docstatus: DocStatus.INWORK.id,
        doc_package_temp_id: docPackageTempId,
        doc_package_id: docPackageTempId,
        date_send_to_doc_package: new Date(),
        serial_number: lastSerialNumber + 1,
      });

      await queryRunner.manager.update(
        FileItemEntity,
        { id: In(fileIds) },
        {
          is_doc_package: true,
        },
      );

      // Создать report
      await this.reportWordDocService.reportDocFile({
        token,
        doc_id: docId,
        manager: queryRunner.manager,
      });

      // Внутренняя опись и подпись по ней должны слетать,
      // если в дело добавляется или исключается документ
      await deleteInnerInventoryDocPackage([docPackage], queryRunner.manager);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customError(error.message);
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  async excludeDocs(docIds: number[]): Promise<boolean> {
    const docs = await this.docRepository.findBy({
      id: In(docIds),
      del: false,
      temp: false,
    });

    if (docs.length !== docIds.length) {
      customError(this.ERR_MSG_DOC_NOT_FOUND);
    }

    const docPackagesId = [...new Set(docs.map((doc) => doc.doc_package_id))];

    const docPackages = await this.docPackageRepository.find({
      relations: { Nomenclature: true },
      where: {
        id: In(docPackagesId),
        del: false,
        Nomenclature: { del: false },
      },
    });

    if (docPackagesId.length !== docPackages.length) {
      customError(this.ERR_MSG_DOC_PACKAGE_NOT_FOUND);
    }

    // Нельзя исключить документ из дела, которое помещено в опись
    const docPackagesIncludesInInventory = docPackages.filter((docPackage) => {
      return docPackage.status_id === DocPackageStatus.INCLUDED_IN_INVENTORY;
    });

    if (docPackagesIncludesInInventory[0]) {
      const dp = docPackagesIncludesInInventory[0];
      const nmncl = await dp?.Nomenclature;
      customError(`Дело ${nmncl?.index} ${nmncl?.name} включено в опись`);
    }

    // Нельзя исключить документ из дела, которое помещено в акт
    const docPackagesIncludesInAct = docPackages.filter((docPackage) => {
      return docPackage.status_id === DocPackageStatus.INCLUDED_IN_ACT;
    });

    if (docPackagesIncludesInAct[0]) {
      const dp = docPackagesIncludesInAct[0];
      const nmncl = await dp?.Nomenclature;
      customError(`Дело ${nmncl?.index} ${nmncl?.name} включено в акт`);
    }

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Исключаем документы из дела
      await excludeDocsFromDocPackage(docs, docPackages, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customError(error.message);
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  async endWorkDoc(id: number): Promise<DocEntity | HttpException> {
    //зарегестрирован и на расмотрении
    try {
      const doc = await this.docRepository.findOne({
        where: {
          id: id,
        },
      });

      if (doc.docstatus == DocStatus.REGISTRATE.id || doc.docstatus == DocStatus.INVIEW.id) {
        await this.docRepository.update(
          { id: id },
          {
            docstatus: DocStatus.DONE.id,
          },
        );
        return await this.docRepository.findOne({
          where: {
            id: id,
          },
        });
      }
      return new HttpException(`${PREF_ERR} Ошибка завершение документа`, 404);
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  async sendMail(
    docId: number,
    corrIds: number[],
    fileIds: number[],
    rkk: boolean,
    org: string,
    emp: number,
  ): Promise<boolean> {
    const doc = await this.docRepository.findOne({
      relations: {
        Tdoc: true,
        Author: {
          User: { Staff: true },
          post: true,
        },
        Correspondent: { Org: true, Citizen: true },
      },
      where: {
        id: docId,
        del: false,
        temp: false,
      },
    });

    if (!doc) {
      customError(this.ERR_MSG_DOC_NOT_FOUND);
    }

    if (doc?.cls_id !== DocumentTypes.OUTCOME) {
      customError(this.ERR_MSG_DOC_STATUS);
    }

    // Допустимый статус - Зарегистрирован
    if (doc.docstatus !== DocStatus.REGISTRATE.id) {
      customError(this.ERR_MSG_DOC_STATUS);
    }

    const emailList: string[] = [];

    for await (const corrId of corrIds) {
      const corr = (await doc.Correspondent).filter((corr) => corr.id === corrId)[0];

      if (!corr) {
        customError("Корреспондент не найден");
      }

      // TODO: Неплохо бы вынести тип доствки в enum
      if (corr?.delivery_id !== 2) {
        customError("Тип доставки должен быть - электронная почта");
      }

      if (corr.org) {
        const org = await corr.Org;
        emailList.push(org.email);
      }

      if (corr.citizen_id) {
        const citizen = await corr.Citizen;
        emailList.push(citizen.email);
      }
    }

    const email = emailList.join(", ");

    const files: FileBlockEntity[] = await fileDBListBlock({
      doc_id: docId,
      dataSource: this.dataSource,
    });

    const attachments: IAttachmentsForSendMail[] = [];
    const isFileId = !!Array.isArray(fileIds);

    for (const file of files) {
      const FileVersionMain = await file.FileVersionMain;
      const FileItemMain = FileVersionMain.FileItemMain;
      const FileItemArj = FileVersionMain.FileItemArj;
      const name = FileVersionMain.name;
      const ext = FileItemMain.ext;
      const volume = getPathVolumeEntity(org, FileItemMain);

      if (!isFileId || fileIds.includes(FileItemMain.id)) {
        attachments.push({
          stream: null,
          compress: FileItemMain.compress,
          filename: `${name}.${ext}`,
          content: volume,
        });
      }

      if (
        FileItemArj &&
        FileItemMain.volume !== FileItemArj.volume &&
        (!isFileId || fileIds.includes(FileItemArj.id))
      ) {
        const volume = getPathVolumeEntity(org, FileItemArj);
        attachments.push({
          stream: null,
          compress: FileItemArj.compress,
          filename: `${name}.${FileItemArj.ext}`,
          content: volume,
        });
      }
    }

    const validAttachments: IAttachmentsForSendMail[] = [];

    for await (const att of attachments) {
      try {
        await fs.access(att.content, constants.F_OK);
        validAttachments.push({ ...att });
      } catch {}
    }

    if (rkk) {
      const streamRkk = await this.reportWordDocService.reportDocStream({
        emp_id: emp,
        doc_id: docId,
        res: null,
      });

      validAttachments.push({
        stream: streamRkk,
        compress: false,
        filename: "ркк.docx",
        content: null,
      });
    }

    const body = doc?.body ? `${doc.body}<br><br>` : "";
    const signed = doc?.signed ? `Подписал: ${doc.signed}<br>` : "";
    const exec = await (await (await doc?.Exec)?.User)?.Staff;
    let staff;
    let post;
    if (exec) {
      staff = exec;
      post = await (await doc.Exec).post;
    } else {
      staff = await (await (await doc.Author).User).Staff;
      post = await (await doc.Author).post;
    }

    const fio = [staff?.ln, staff?.nm, staff?.mn].filter((a) => a).join(" ");
    const postNm = post?.nm ? ` / ${post?.nm}` : "";
    const html = `${body}${signed}Автор:${fio}${postNm}`;
    const tdoc = await doc.Tdoc;

    try {
      await sendMail({
        org: org,
        email: email,
        html: html,
        attachments: validAttachments,
        subject: tdoc?.nm,
      });

      // Обновляем дату фактической передачи
      await this.CorrespondenRepository.update(
        { id: In(corrIds) },
        {
          date_fact: new Date(),
        },
      );
    } catch (e) {
      customError(e.message);
    }
    return true;
  }

  async downloadBookDoc(body: bodyDownloadBookDTO, token: IToken, res) {
    const url = token.url;
    let sqlWhere = ``;
    const params = [];
    if (body.startAt && body.endAt) {
      sqlWhere = "document.dtc::date >= $1 and document.dtc::date <= $2 and";
      const date = this.refactorDate(body.startAt, body.endAt);
      params.push(...date);
    }

    params.push(body.property.typeDoc);
    let documentArray = undefined;

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Журнала входящих документов");
    if (body.property.typeDoc === KDOC_ID.INCOME) {
      worksheet.addRow([
        "Регистратор",
        "Рег.№",
        "Дата регистрации",
        "Исх.дата",
        "Вид документа",
        "Доступ",
        "Тип доставки",
        "Статус",
        "Примечание",
        "Исх.№",
        "Заголовок",
        "Подписал",
        "Корреспондент",
      ]);
      documentArray = await this.docRepository.query(
        `select CONCAT(staff.ln, ' ', staff.nm, ' ', staff.mn, ' / ', post.nm) as registr,   -- регистратор
                document.reg_num                                               as regNum,          -- рег №
                document.dr                                                    as "dateRegisrate", -- дата регистрации
                document.outd                                                  as outd,            -- исх.дата
                ViewDoc.nm                                                     as ViewDocument,    -- вид документа
                priv.nm                                                        as priv,            -- доступ
                delivery.nm                                                    as "deliveryName",  -- тип доставки
                docstatus.nm                                                   as "docStatusName", -- статус
                document.nt                                                    as note,            -- примечание
                document.outnum                                                as outnum,          -- исх №
                document.header                                                as header,          -- заголовок
                document.signed                                                as signed,          -- Подписал
                CASE
                  WHEN document.isorg THEN (org.nm)
                  ELSE (citizen.ln || ' ' || substring(citizen.nm for 1) || '.' || substring(citizen.mn for 1) || '.') --  -- корреспондент
                  END
         from sad.doc AS document
                left join sad.emp as emp on document.author = emp.id
                left join sad.org as org on document.org_id = org.id
                left join sad.citizen as citizen on document.citizen_id = citizen.id
                left join sad.users as users on emp.user_id = users.id
                left join sad.delivery as delivery on document.delivery = delivery.id
                left join sad.staff as staff on users.user_id = staff.id
                left join sad.post as post on emp.post_id = post.id
                left join sad.tdoc as ViewDoc on document.tdoc = ViewDoc.id
                left join sad.priv as priv on document.priv = priv.id
                left join sad.docstatus as docstatus on document.docstatus = docstatus.id
          where ${sqlWhere} document.del = false
            and document.temp = false
            and document.cls_id = $${params.length}  ORDER BY document.id DESC
        `,
        [...params],
      );
      for (const documentKey of documentArray) {
        if (documentKey.outd) {
          documentKey.outd = dayjs(documentKey.dr).format("DD.MM.YYYY");
        }

        if (documentKey.dateRegisrate) {
          documentKey.dateRegisrate = dayjs(documentKey.dateRegisrate).format("DD.MM.YYYY");
        }

        worksheet.addRow(Object.values(documentKey));
      }
    }
    if (body.property.typeDoc === KDOC_ID.OUTCOME) {
      worksheet.addRow([
        "Исполнитель",
        "Заголовок",
        "Рег.№",
        "Дата регистрации",
        "Вид документа",
        "Доступ",
        "Подписал",
        "Примечание",
        "Статус",
        "Адресат",
      ]);

      documentArray = await this.docRepository.query(
        `
          SELECT document.id as "docId",
              CASE
                   WHEN length(CONCAT(staff.ln, ' ', staff.nm, ' ', staff.mn, ' / ', post.nm)) > 5
                     THEN CONCAT(staff.ln, ' ', staff.nm, ' ', staff.mn, ' / ', post.nm)::text
                   ELSE ('-')::text
                   END               registr,
                 document.header  as header,
                 document.reg_num as regNum,
                 document.dr      as "dateRegisrate",
                 ViewDoc.nm       as ViewDocument,
                 priv.nm          as priv,
                 document.signed  as signed,
                 document.nt      as note,
                 docstatus.nm     as docStatusName,
                 CASE
                   WHEN document.isorg THEN string_agg(org.nm, ', ' ORDER BY org.id)
                   ELSE string_agg(
                         citizen.ln || ' ' || substring(citizen.nm for 1) || '.' || substring(citizen.mn for 1) ||
                         '.', '')::text
                   END            as "nameOrgOrCitizen"
          from sad.doc AS document
                 left join sad.emp as emp on document.author = emp.id
                 left join sad.users as users on emp.user_id = users.id
                 left join sad.fromwh as fromwh on document.id = fromwh.doc_id
                 left join sad.citizen as citizen on fromwh.citizen_id = citizen.id
                 left join sad.org as org on fromwh.org = org.id
                 left join sad.staff as staff on users.user_id = staff.id
                 left join sad.post as post on emp.post_id = post.id
                 left join sad.tdoc as ViewDoc on document.tdoc = ViewDoc.id
                 left join sad.priv as priv on document.priv = priv.id
                 left join sad.docstatus as docstatus on document.docstatus = docstatus.id
          where ${sqlWhere} document.del = false
            and document.temp = false
            and document.cls_id = $${params.length}
          GROUP BY document.id, ViewDoc.nm, priv.nm, docstatus.nm, staff.id, post.id
          ORDER BY document.id DESC;
        `,
        [...params],
      );

      for (const documentKey of documentArray) {
        if (documentKey.dateRegisrate) {
          documentKey.dateRegisrate = dayjs(documentKey.dateRegisrate).format("DD.MM.YYYY");
        }

        // Решения для нахождения адресатов исхоящих документов
        // @TODO заменить на SQL
        const correspondent = await this.CorrespondenRepository.find({
          where: {
            doc_id: documentKey.docId,
          },
          relations: {
            Org: true,
            Citizen: true,
          },
        });
        let allCorrecpondent: string[] | string = [];
        if (correspondent) {
          for (const corr of correspondent) {
            const org: OrgEntity = await corr.Org;
            const citizen: CitizenEntity = await corr.Citizen;
            if (org) {
              allCorrecpondent.push(org.nm);
            }

            if (citizen) {
              allCorrecpondent.push(citizen.ln + " " + citizen.nm[0] + ". " + citizen.mn[0] + ".");
            }
          }

          delete documentKey.docId;

          documentKey.nameOrgOrCitizen = allCorrecpondent.filter((value, index, self) => {
            return self.indexOf(value) === index;
          });
          documentKey.nameOrgOrCitizen = documentKey.nameOrgOrCitizen.join(", ");
          allCorrecpondent = [];
        }
        delete documentKey.docId;

        worksheet.addRow(Object.values(documentKey));
      }
    }
    if (body.property.typeDoc === KDOC_ID.INNER) {
      worksheet.addRow([
        "Исполнитель",
        "Заголовок",
        "Рег.№",
        "Дата регистрации",
        "Вид документа",
        "Доступ",
        "Подписал",
        "Примечание",
        "Статус",
      ]);
      documentArray = await this.docRepository.query(
        `
          select CONCAT(staff.ln, ' ', staff.nm, ' ', staff.mn,  ' / ', post.nm) as registr,
                 document.header                                                       as header,
                 document.reg_num                                                      as regNum,
                 document.dr                                                           as "dateRegisrate",
                 typeDoc.nm                                                            as typeDocument,
                 priv.nm                                                               as priv,
                 document.signed                                                       as signed,
                 document.nt                                                           as note,
                 docstatus.nm                                                          as docStatusName

          from sad.doc AS document
                 left join  sad.emp as emp on emp.id = document.author
                 left join sad.users as users on emp.user_id = users.id
                 left join sad.staff staff ON staff.id = users.user_id
                 left join sad.post as post on emp.post_id = post.id
                 left join sad.tdoc as typeDoc on document.tdoc = typeDoc.id
                 left join sad.priv as priv on document.priv = priv.id
                 left join sad.docstatus as docstatus on document.docstatus = docstatus.id

          where ${sqlWhere} document.del = false
            and document.temp = false
            and document.cls_id = $${params.length} ORDER BY document.id DESC;
        `,
        [...params],
      );

      for (const documentKey of documentArray) {
        if (documentKey.dr) {
          documentKey.dr = dayjs(documentKey.dr).format("DD.MM.YYYY");
        }

        worksheet.addRow(Object.values(documentKey));
      }
    }

    const pathFolder = path.resolve(process.env.FILE_STAGE, url, "doc_book");
    const dateTime = new Date().toISOString().slice(0, 10).replace(/-/g, "") + uuidv4();
    const pathToFile = path.resolve(
      process.env.FILE_STAGE,
      url,
      `doc_book`,
      `doc_book-${body.property.typeDoc}-${dateTime}.xlsx`,
    );
    await createPath(pathFolder);
    await workbook.xlsx.writeFile(pathToFile);
    res.download(pathToFile);
  }

  /**
   * НАЙТИ ДУБЛИКАТЫ ДОКУМЕНТОВ
   */
  async checkDublicateDocRegistrate(document: DocInput): Promise<number> {
    const { tdoc, header, outnum, citizen_id, org_id, outd } = document;
    const sqlConditionsAnd = [
      !header
        ? "doc_rls_off.header is null"
        : `doc_rls_off.header = '${header}' AND doc_rls_off.body = '${header}'`,
      !outnum ? "doc_rls_off.outnum is null" : `doc_rls_off.outnum = '${outnum}'`,
      !outd
        ? "doc_rls_off.outd is null"
        : `doc_rls_off.outd = '${dayjs(outd).format("YYYY-MM-DD")}'`,
      citizen_id ? `doc_rls_off.citizen_id = ${citizen_id}` : `doc_rls_off.org_id = ${org_id}`,
    ];

    const [countDuplicate] = await this.dataSource.manager.query(
      `
      SELECT COUNT(id) AS count
      FROM sad.doc_rls_off AS doc_rls_off
      WHERE doc_rls_off.docstatus = $1
        AND doc_rls_off.tdoc = $2
        AND ${sqlConditionsAnd.join(" AND ")}
    `,
      [DocStatus.REGISTRATE.id, tdoc],
    );

    return countDuplicate.count;
  }

  refactorDate(startDate: string, endDate: string): [string, string] {
    const start = dayjs(startDate).format("YYYY-MM-DD");
    const end = dayjs(endDate).format("YYYY-MM-DD");

    return [start, end];
  }
}
