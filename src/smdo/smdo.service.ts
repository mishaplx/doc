import "dotenv/config";

import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import dayjs from "dayjs";
import cron from "node-cron";
import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "src/entity/#organization/file/fileVersion.entity";
import { RelEntity } from "src/entity/#organization/rel/rel.entity";
import { SmdoPackagesReceiversEntity } from "src/entity/#organization/smdo/smdo_packages_receivers.entity";
import { SmdoStackEntity } from "src/entity/#organization/smdo/smdo_stack.entity";
import {
  getPathVolume,
  getPathVolumeEntity,
  readFileVolume,
  writeFileVolume,
} from "src/modules/file/utils/file.volume.utils";
import { SETTING_CONST, TSettingConstKey } from "src/modules/settings/settings.const";
import { getSettingsValBool } from "src/modules/settings/settings.util";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

// import request from "request-promise";
const request = require("request-promise");

import { DATA_SOURCE } from "../database/datasource/tenancy/tenancy.symbols";
import { CorrespondentEntity } from "../entity/#organization/correspondent/correspondent.entity";
import { DocEntity } from "../entity/#organization/doc/doc.entity";
import { TdocEntity } from "../entity/#organization/doc/tdoc.entity";
import { FileBlockEntity } from "../entity/#organization/file/fileBlock.entity";
import { LanguageEntity } from "../entity/#organization/language/language.entity";
import { OrgEntity } from "../entity/#organization/org/org.entity";
import { RegionEntity } from "../entity/#organization/region/region.entity";
import { SignEntity } from "../entity/#organization/sign/sign.entity";
import { SmdoAbonentsEntity } from "../entity/#organization/smdo/smdo_abonents.entity";
import { SmdoDocTypesEntity } from "../entity/#organization/smdo/smdo_doc_types.entity";
import { SmdoFileTypesEntity } from "../entity/#organization/smdo/smdo_file_types.entity";
import { SmdoPackagesEntity } from "../entity/#organization/smdo/smdo_packages.entity";
import { SmdoSedListEntity } from "../entity/#organization/smdo/smdo_sed_list.entity";
import { DeliveryEnum, DocStatus } from "../modules/doc/doc.const";
import { FILE } from "../modules/file/file.const";
import { fileDBCreateMain } from "../modules/file/utils/db/file.db.createMain.utils";
import { wLogger } from "../modules/logger/logging.module";
import { customError, errWithoutPref, isPrefErr } from "src/common/type/errorHelper.type";

const GS_DOP = {
  'TOKEN_VAL': 'TOKEN_VAL',
  'TOKEN_EXP': 'TOKEN_EXP',
  'JOBS': 'JOBS',
}
type gsType = { [key in TSettingConstKey | keyof typeof GS_DOP]?: string };
type reqAuthType = { Authorization: string; };
type reqHeaderType = { headers: reqAuthType; };
type reqTimeoutType = reqHeaderType & { timeout: number; };

const IDD = "СМДО: ";

@Injectable()
export class SmdoService {
  private readonly org: string;
  private readonly gs: gsType;
  private readonly fileBlockRepository: Repository<FileBlockEntity>;
  private readonly fileItemRepository: Repository<FileItemEntity>;
  private readonly fileVersionRepository: Repository<FileVersionEntity>;
  private readonly docRepository: Repository<DocEntity>;
  private readonly docTypesRepository: Repository<SmdoDocTypesEntity>;
  private readonly fileTypesRepository: Repository<SmdoFileTypesEntity>;
  private readonly abonentsRepository: Repository<SmdoAbonentsEntity>;
  private readonly orgRepository: Repository<OrgEntity>;
  private readonly correspondentRepository: Repository<CorrespondentEntity>;
  private readonly sedListRepository: Repository<SmdoSedListEntity>;
  private readonly packagesRepository: Repository<SmdoPackagesEntity>;
  private readonly stackRepository: Repository<SmdoStackEntity>;
  private readonly relTypesRepository: Repository<RelEntity>;
  private readonly packagesReceiversRepository: Repository<SmdoPackagesReceiversEntity>;
  private readonly signRepository: Repository<SignEntity>;

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    this.org = this.dataSource.options.database as string;
    this.gs = global.settings[this.org] as gsType;
    this.fileBlockRepository = dataSource.getRepository(FileBlockEntity);
    this.fileItemRepository = dataSource.getRepository(FileItemEntity);
    this.fileVersionRepository = dataSource.getRepository(FileVersionEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
    this.docTypesRepository = dataSource.getRepository(SmdoDocTypesEntity);
    this.fileTypesRepository = dataSource.getRepository(SmdoFileTypesEntity);
    this.abonentsRepository = dataSource.getRepository(SmdoAbonentsEntity);
    this.orgRepository = dataSource.getRepository(OrgEntity);
    this.correspondentRepository = dataSource.getRepository(CorrespondentEntity);
    this.relTypesRepository = dataSource.getRepository(RelEntity);
    this.sedListRepository = dataSource.getRepository(SmdoSedListEntity);
    this.packagesRepository = dataSource.getRepository(SmdoPackagesEntity);
    this.stackRepository = dataSource.getRepository(SmdoStackEntity);
    this.packagesReceiversRepository = dataSource.getRepository(SmdoPackagesReceiversEntity);
    this.signRepository = dataSource.getRepository(SignEntity);
  }

  /**
   * ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
   */
  url(): string {
    return this.gs[SETTING_CONST.SMDO_URL.nm];
  }

  url_pack(): string {
    return this.gs[SETTING_CONST.SMDO_URL.nm]+'receiver/1.0.0/org/SMDO~1.0.0/package';
  }

  async req_auth(): Promise<reqAuthType> {
    return {
      Authorization: `Bearer ${await this.getToken()}`
    };
  }

  async req_header(): Promise<reqHeaderType> {
    return {
      headers: await this.req_auth(),
    };
  }

  async req_timeout(): Promise<reqTimeoutType> {
    return {
      ... await this.req_header(),
      timeout: 0,
    };
  }


  async createAndSendPackage(corrIds, documentId, addDocuments, files, context): Promise<any> {
    try {
      // получить ID абонентов по ORG ID
      const abonentSmdoId = [];
      for (const corrId of corrIds) {
        const correspondent = await this.correspondentRepository.findOne({ where: { id: corrId } });
        if (!correspondent) customError(`${IDD}корреспондент с id=${corrId} не найден. [doc_id=${addDocuments}]`);
        const abonent = await this.orgRepository.findOne({ where: { id: correspondent.org } });
        if (!abonent?.smdoId) customError(`${IDD}smdoId для организации с id: ${correspondent.org} не найден. [doc_id=${addDocuments}]`);
        abonentSmdoId.push(abonent.smdoId);
      }
      let addDocumentsType = 0;
      if (addDocuments) {
        for (const file of files) {
          if (file.type === "add") addDocumentsType = 1;
          if (file.type === "replace") addDocumentsType = 2;
        }
      }
      const smdoPackage = await this.createPackage(abonentSmdoId, documentId, addDocumentsType);
      for (const file of files) {
        let addDocuments = false;
        if (file.type === "add" || file.type === "replace") addDocuments = true;
        await this.attachFileToPackage(
          smdoPackage.packageId,
          file.fileBlockId,
          addDocuments,
          context,
        );
      }
      await this.sendPackage(smdoPackage.packageId);
      for (const corrId of corrIds)
        await this.correspondentRepository.save({ id: corrId, date_fact: new Date() });
      return { message: "OK", status: 200 };

    } catch (err) {
      customError(`${IDD}ошибка формирования и отправки пакета [doc_id=${documentId}]`, err);
    }
  }


  /**
   * СФОРМИРОВАТЬ ПАКЕТ
   */
  async createPackage(abonentId: any, documentId: number, addDocuments: number): Promise<any> {
    try {
      if (!abonentId) customError(`${IDD}нет ID абонента [doc_id=${addDocuments}]`);
      if (!documentId) customError(`${IDD}нет ID документа [doc_id=${addDocuments}]`);
      const abonents = await this.abonentsRepository.find({ where: { smdoId: In(abonentId) } });
      if (abonents.length === 0) customError(`${IDD}абонент отсутствует [doc_id=${addDocuments}]`);
      const document = await this.docRepository.findOne({
        where: { id: documentId },
        relations: { Tdoc: true, Priv: true },
      });
      if (!document) customError(`${IDD}документ отсутствует [doc_id=${addDocuments}]`);
      const smdoAbonent = await this.abonentsRepository.findOne({
        where: {
          smdoCode: this.gs[SETTING_CONST.SMDO_CODE.nm],
        },
      });
      if (!smdoAbonent) customError(`${IDD}абонент отправителя указан не верно [doc_id=${addDocuments}]`);
      const packageToSend = await this.bodyMaker(abonents, document, smdoAbonent, addDocuments);
      const result = await axios.post(
        this.url_pack(),
        packageToSend,
        await this.req_timeout(),
      );
      if (result.status === 200 || result.status === 201) {
        if (smdoAbonent?.smdoId === "ROUTER") smdoAbonent.smdoId = null;
        const smdoPackage = result.data;
        await this.packagesRepository.save({
          smdoId: smdoPackage?.packageId,
          confirmId: smdoPackage?.confirmId,
          fromAbonentId: smdoAbonent?.smdoId,
          toAbonentId: abonents[0]?.smdoId,
          ack: false,
          smdoParentId: smdoPackage?.parentId,
          attachments: smdoPackage?.attachments,
          body: smdoPackage?.body,
          dateIn: new Date(),
          dateSent: smdoPackage?.dateSent,
          headerId: smdoPackage?.headerId,
          type: "Исходящий",
          status: "Новый",
          // новые поля
          outNumber: smdoPackage?.body?.envelop?.body?.document?.regNumber?.value ?? null,
          outDate: smdoPackage?.body?.envelop?.body?.document?.regNumber?.regdate ?? null,
          idnumber: `${
            this.gs[SETTING_CONST.SMDO_CODE.nm]
          }_${document.id.toString()}`,
          docId: document.id,
          inNumber: document.reg_num ?? null,
          inDate: document.dr ?? null,
        });
        for (const abonent of abonents) {
          await this.packagesReceiversRepository.save({
            packageSmdoId: smdoPackage?.packageId,
            abonentSmdoId: abonent?.smdoId,
          });
        }
        return smdoPackage;
      } else return { status: result.status };
    } catch (err) {
      customError(`${IDD}ошибка формирования пакета [doc_id=${documentId}]`, err);
    }
  }

  // формирование тела пакета
  async bodyMaker(
    abonents: SmdoAbonentsEntity[],
    document: DocEntity,
    ownerAbonent: SmdoAbonentsEntity,
    addDocumentsType = 0,
  ) {
    try{
      const to = [];
      const receiver = [];
      for (const abonent of abonents) {
        to.push({
          idAbonent: abonent.smdoId,
          typeAbonent: "SMDO",
          name: abonent.brandName ?? abonent.fullName,
          orgId: abonent.id,
          applicationId: ownerAbonent.smdoId,
        });
        receiver.push({
          id: abonent.smdoCode,
          name: abonent.brandName ?? abonent.fullName,
          // sys_id: this.gs[SETTING_CONST.SMDO_SYSTEM_ID.nm],
          organization: {
            organization_string: abonent.fullName,
            fullname: abonent.fullName,
            shortname: abonent.abbreviatedName,
          },
        });
      }
      const priv = await document.Priv;
      let addDocumentsObject;
      let addToBody;
      if (addDocumentsType > 0)
        addDocumentsObject = this.makeAddDocumentsBody(document, addDocumentsType);
      else addToBody = await this.makeDocumentBody(document, ownerAbonent, priv);
      let parentId = null;
      if (addToBody?.document?.docParent) {
        parentId = addToBody.document.docParent.parentId;
        delete addToBody.document.docParent.parentId;
      }
      if (addDocumentsObject) {
        const oldestPackage = await this.packagesRepository.findOne({
          where: {
            docId: document.id,
            type: "Исходящий",
          },
          order: {
            dateSent: "ASC",
          },
        });
        if (oldestPackage) parentId = oldestPackage.smdoId;
      }
      const msgType = addDocumentsType > 0 ? 2 : 1;
      const body = {
        dateSent: new Date().toISOString(),
        dateIn: new Date().toISOString(),
        ack: false,
        parentId: null,
        to,
        body: {
          envelop: {
            body: {
              ...addToBody,
              ...addDocumentsObject,
            },
            header: {
              sender: {
                id: ownerAbonent.smdoCode,
                name: ownerAbonent.brandName,
                sys_id: this.gs[SETTING_CONST.SMDO_SYSTEM_ID.nm],
                system: this.gs[SETTING_CONST.SMDO_SYSTEM.nm],
                system_details:
                this.gs[SETTING_CONST.SMDO_SYSTEM_DETAILS.nm],
              },
              msg_type: msgType,
              receiver,
              msg_acknow: 2,
            },
            type: "SDIP-2.1.1",
            msg_id: uuidv4(),
            dtstamp: this.timestampWithoutMilliseconds(),
            subject: `${document.reg_num} от ${new Date(document.dtc).toISOString().split("T")[0]}`,
          },
        },
      };
      if (parentId) body.parentId = parentId;
      else delete body.parentId;
      return body;
    } catch (err) {
      customError(`${IDD}ошибка формирования тела пакета`, err, document);
    }
  }

  timestampWithoutMilliseconds() {
    const currentDate = new Date();
    const isoString = currentDate.toISOString();
    const withoutMilliseconds = isoString.slice(0, -5) + "Z";
    return withoutMilliseconds;
  }

  // стандартное тело "Документ"
  async makeDocumentBody(document: DocEntity, ownerAbonent, priv) {
    if (!document.signed)
      customError(`${IDD}в документе нужно заполнить поле: Подписал`, undefined, document);
    let pages = Number(document.pg);
    if (!pages || pages === 0) pages = 1;
    const body = {
      document: {
        docParent: null,
        kind: (await document.Tdoc)?.smdoDocTypes ?? "Не указано",
        type: 0,
        pages,
        title: document.body ?? "Отсутствует",
        author: [
          {
            organizationWithSign: {
              fullname: ownerAbonent.fullName,
              shortname: ownerAbonent.brandName,
              organization_string: `${ownerAbonent.fullName}, ${ownerAbonent.brandName}`,
              officialPersonWithSign: [
                {
                  name: {
                    value: document.signed,
                    secname: null,
                    firstname: null,
                    fathersname: null,
                  },
                  rank: null,
                  address: null,
                  econtact: null,
                  official: null,
                  signDate: null,
                },
              ],
            },
          },
        ],
        idnumber: `${
          this.gs[SETTING_CONST.SMDO_CODE.nm]
        }_${document.id.toString()}`,
        confident: {
          flag: 0,
          value: priv.nm ?? "Общий",
        },
        regNumber: {
          value: `${document.reg_num}`,
          regdate: `${new Date(document.dtc).toISOString().split("T")[0]}`,
        },
      },
    };
    // логика добавления docParent
    const relation = await this.relTypesRepository.findOne({
      where: { rel_types_id: 1, doc_direct_id: document.id },
      order: {
        date_create: "DESC",
      },
    });

    if (relation) {
      const smdoPackage = await this.packagesRepository.findOne({
        where: { docId: relation.doc_reverse_id },
      });
      if (!smdoPackage) customError(`${IDD}родительский пакет для связки не найден`);
      const parentAbonent = await this.abonentsRepository.findOne({
        where: { smdoId: smdoPackage.fromAbonentId },
      });
      if (!parentAbonent)
        customError(`${IDD}родительский абонент для связки не найден`);
      const documentParent = await this.docRepository.findOne({
        where: { id: relation.doc_reverse_id },
      });
      body.document.docParent = {
        parentId: smdoPackage.smdoId,
        idnumber: smdoPackage.idnumber,
        lastmsg_id: smdoPackage.body.envelop.msg_id,
        parmsg_id:
          smdoPackage?.body?.envelop?.body?.document?.docParent?.parmsg_id ||
          smdoPackage.body.envelop.msg_id,
        delivery_type: 1,
        parorg_id: parentAbonent.smdoCode,
        regNumber: {
          value: `${documentParent.outnum}`,
          regdate: `${new Date(documentParent.outd).toISOString().split("T")[0]}`,
        },
      };
    }
    if (!body.document.docParent) delete body.document.docParent;
    return body;
  }

  // тело для дополнения
  makeAddDocumentsBody(document, addDocumentsType) {
    return {
      addDocuments: {
        folder: [
          {
            add_type: addDocumentsType,
            contents: document.body ?? "Отсутствует",
            referred: {
              retype: "1",
              idnumber: `${
                this.gs[SETTING_CONST.SMDO_CODE.nm]
              }_${document.id.toString()}`,
              regNumber: {
                value: `${document.reg_num}`,
                regdate: `${new Date(document.dtc).toISOString().split("T")[0]}`,
              },
            },
          },
        ],
      },
    };
  }

  // удаление пакета
  async deletePackage(packageId: string) {
    if (!packageId) customError(`${IDD}введите ID пакета`);

    const result = await axios.delete(
      `${this.url_pack()}/${packageId}`,
      await this.req_timeout(),
    );
    if (result.status === 204) {
      return { status: 204, message: "Пакет удалён" };
    }
  }

  generateRandomString(length = 20) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }

  // прикрепить файл к пакету
  async attachFileToPackage(packageId: string, fileId: number, addDocuments: boolean, context) {
    if (!packageId) {
      customError(`${IDD}введите ID пакета`);
    }

    if (!fileId) {
      customError(`${IDD}введите ID файла`);
    }

    const fileItem = await this.fileItemRepository.findOne({
      where: { id: fileId },
    });

    const sign = await this.signRepository.findOne({
      where: { file_item_id: fileId },
    });

    if (!fileItem) {
      throw new NotFoundException("Файл не найден");
    }

    const fileVersion = await this.fileVersionRepository.findOne({
      where: { id: fileItem.file_version_id },
    });

    if (!fileVersion) {
      throw new NotFoundException("Файл не найден");
    }

    const nameOrg = context.req?.headers?.org?.toLowerCase() || this.dataSource.name;
    const filePath = getPathVolumeEntity(nameOrg, fileItem);

    const stream = await readFileVolume({
      filePath,
      compress: fileItem.compress,
      isProxy: true,
    });

    stream.on("error", (err) => wLogger.error(`${IDD}ошибка чтения файла`, filePath, err));
    const referenceId: string = this.generateRandomString();
    const options = {
      method: "POST",
      url: `${this.url_pack()}/${packageId}/attach`,
      ...{
        ...await this.req_header(),
        "Content-Type": "multipart/form-data; b",
      },
      formData: {
        file: {
          value: stream,
          options: {
            filename: referenceId,
            contentType: null,
          },
        },
      },
    };

    const result = await request(options);

    if (result) {
      const answer = JSON.parse(result);
      const attachId: string = answer.id;
      const fileName = `${fileVersion.name}.${fileItem.ext}`;

      if (sign) {
        await this.signAttachmentInPackage(packageId, attachId, sign.sign);
      }

      const smdoPackage = await this.getPackage(packageId);

      const found = await this.packagesRepository.findOne({
        where: { smdoId: smdoPackage?.packageId },
      });

      await this.dataSource.transaction(async (manager) => {
        await manager.save(SmdoPackagesEntity, {
          id: found.id,
          attachments: smdoPackage?.attachments,
        });

        await this.transferInfo(packageId, manager, attachId, referenceId, fileName, addDocuments);
      });
      return smdoPackage;
    }
    throw new NotFoundException("Ошибка");
  }

  // удалить файл из пакета
  async deleteFileFromPackage(packageId: string, attachId: string) {
    if (!packageId) {
      customError(`${IDD}введите ID пакета`);
    }

    if (!attachId) {
      customError(`${IDD}введите ID вложения`);
    }

    const result = await axios.delete(
      `${this.url_pack()}/${packageId}/attach/${attachId}`,
      await this.req_timeout(),
    );

    if (result.status === 204) {
      return { status: 204, message: "Файл удалён" };
    }

    throw new BadRequestException("Ошибка", {
      description: result.data,
    });
  }

  // добавить или изменить ЭЦП вложения
  async signAttachmentInPackage(packageId: string, attachId: string, data: string) {
    if (!packageId) {
      customError(`${IDD}введите ID пакета`);
    }

    if (!attachId) {
      customError(`${IDD}введите ID вложения`);
    }

    if (!data) {
      customError(`${IDD}введите значение ЭЦП`);
    }

    const sign = [
      {
        keyId: null,
        signer: null,
        operationType: "null",
        origSignatire: "null",
        data: `${data}`,
      },
    ];
    const result = await axios.put(
      `${this.url_pack()}/${packageId}/attach/${attachId}/signs`,
      sign,
      await this.req_timeout(),
    );

    if (result.status === 200 || result.status === 201) {
      const smdoPackage = await this.getPackage(packageId);
      const found = await this.packagesRepository.findOne({
        where: { smdoId: smdoPackage?.packageId },
      });

      await this.packagesRepository.save({
        id: found.id,
        attachments: smdoPackage?.attachments,
      });

      return smdoPackage;
    }

    customError(`${IDD}ошибка`);
  }

  // удалить ЭЦП вложения
  async unsignAttachmentInPackage(packageId: string, attachId: string) {
    if (!packageId) {
      customError(`${IDD}введите ID пакета`);
    }
    if (!attachId) {
      customError(`${IDD}введите ID вложения`);
    }

    const result = await axios.delete(
      `${this.url_pack()}/${packageId}/attach/${attachId}/signs`,
      await this.req_timeout(),
    );

    if (result.status === 204) {
      return { status: 204, message: "ЭЦП удалена" };
    }

    customError(`${IDD}ошибка`);
  }

  // добавить docTransfer и обновить пакет
  async transferInfo(
    packageId: string,
    manager: EntityManager,
    attachId: string,
    referenceId: string,
    fileName: string,
    addDocuments = false,
  ) {
    const smdoPackage = await this.getPackage(packageId);
    if (!smdoPackage.body?.envelop) return;

    let found;

    if (!manager) {
      found = await this.packagesRepository.findOne({
        where: { smdoId: smdoPackage?.packageId },
      });
    } else {
      found = await manager.findOne(SmdoPackagesEntity, {
        where: { smdoId: smdoPackage?.packageId },
      });
    }

    const body = smdoPackage.body.envelop.body;
    if (addDocuments) {
      if (!body.addDocuments) {
        body.addDocuments = {
          folder: [
            {
              add_type: 1,
              contents: body.document.title ?? "Отсутствует",
              referred: {
                retype: "1",
                idnumber: body.document.idnumber,
                regNumber: body.document.regNumber,
              },
            },
          ],
        };
      }

      if (
        body.addDocuments &&
        body.addDocuments.folder &&
        !body.addDocuments.folder[0].docTransfer
      ) {
        body.addDocuments.folder[0].docTransfer = [];
      }
    }

    if (body.document && !body.document.docTransfer) {
      body.document.docTransfer = [];
    }

    for (const attachment of smdoPackage?.attachments) {
      if (attachment.id !== attachId) continue;
      const signature = [];
      for (const sign of attachment.sign) {
        signature.push({
          keyid: sign.keyId,
          value: sign.data,
          signer: sign.signer,
        });
      }
      const fileNameParts = fileName.split(".");
      const infoToPush = {
        data: {
          referenceid: referenceId,
          value: null,
        },
        name: fileName,
        type: `.${fileNameParts[fileNameParts.length - 1]}`,
        description: "Основной файл",
        signature,
      };

      if (addDocuments) {
        infoToPush.description = "Дополнение";
      }

      if (
        body.addDocuments &&
        body.addDocuments.folder &&
        body.addDocuments.folder[0] &&
        body.addDocuments.folder[0].add_type === 2
      )
        infoToPush.description = "Замена";
      // если дополнение - прикрепляем файлы в addDocuments
      addDocuments
        ? body.addDocuments.folder[0].docTransfer.push(infoToPush)
        : body.document.docTransfer.push(infoToPush);
    }
    if (!manager) {
      await this.packagesRepository.save({
        id: found.id,
        body: body,
      });
    } else {
      await manager.save(SmdoPackagesEntity, {
        id: found.id,
        body: body,
      });
    }

    smdoPackage.body.envelop.body = body;
    await this.updatePackage(packageId, smdoPackage);
  }

  // отправить пакет на обработку
  async sendPackage(packageId: string, manager = undefined) {
    if (!packageId) {
      customError(`${IDD}введите ID пакета`);
    }
    let result;
    try {
      result = await axios.get(
        `${this.url_pack()}/${packageId}/send`,
        await this.req_timeout(),
      );
    } catch (err) {
      wLogger.error(`${IDD}ошибка отправки пакета на обработку [id пакета ${packageId}]`, err);
    }

    if (result.status === 204) {
      let found;
      if (manager) {
        found = await manager.findOne(SmdoPackagesEntity, { where: { smdoId: packageId } });
        await manager.save(SmdoPackagesEntity, {
          id: found.id,
          status: "Отправлен",
        });
      } else {
        found = await this.packagesRepository.findOne({ where: { smdoId: packageId } });
        await this.packagesRepository.save({
          id: found.id,
          status: "Отправлен",
        });
      }
      return { statusCode: 200, message: "Пакет отправлен" };
    } else return { statusCode: 400, message: "Пакет не отправлен" };
  }

  // получить список пакетов
  async getPackageList(page = 0) {
    wLogger.info(`${IDD}получение пакетов: страница ${page}`);
    const body = {
      page,
      size: 100,
      onlyNew: true,
    };

    const result = await axios.post(
      `${this.gs[SETTING_CONST.SMDO_URL.nm]}sender/1.0.0/org/SMDO~1.0.0/package`,
      body,
      await this.req_timeout(),
    );

    if (result.status === 200 || result.status === 201) {
      for (const smdoPackage of result.data.content) {
        const findPackage = await this.packagesRepository.findOneBy({
          smdoId: smdoPackage.id,
        });
        if (!findPackage) {
          this.savePackage(smdoPackage);
        }
      }
      if (result.data.hasNext) await this.getPackageList(page + 1);
      return { statusCode: 200, message: "Пакеты получены" };
    } else customError(`${IDD}ошибка`);
  }

  async savePackage(smdoPackage) {
    wLogger.info(`${IDD}сохранение пакета c ID ${smdoPackage.id}: старт`);
    try {
      await this.dataSource.transaction(async (manager) => {
        if (smdoPackage.from.idAbonent === "ROUTER") smdoPackage.from.idAbonent = null;
        let ackType = null;
        let result = null;
        let isAck = false;
        if (smdoPackage?.body?.envelop?.body?.acknowledgement) {
          isAck = true;
        } // возможно квитанция без ack_type

        if (smdoPackage.body?.ackResult) {
          result = smdoPackage.body?.ackResult[0]?.value;
        }

        if (smdoPackage?.body?.envelop?.body?.acknowledgement?.ackResult) {
          result = smdoPackage?.body?.envelop?.body?.acknowledgement?.ackResult[0]?.value;
        }

        if (smdoPackage?.body?.envelop?.body?.acknowledgement?.ack_type === 1) {
          ackType = "Доставка";
          isAck = true;
        } else if (smdoPackage?.body?.envelop?.body?.acknowledgement?.ack_type === 2) {
          ackType = "Регистрация";
          isAck = true;
        }
        if (smdoPackage?.ack) isAck = true;
        await manager.save(SmdoPackagesEntity, {
          smdoId: smdoPackage.id,
          confirmId: smdoPackage.confirmId,
          fromAbonentId: smdoPackage.from?.idAbonent,
          toAbonentId: smdoPackage.to?.idAbonent,
          ack: isAck,
          smdoParentId: smdoPackage.parentId,
          attachments: smdoPackage.attachments,
          body: smdoPackage.body,
          dateIn: smdoPackage.dateIn,
          dateSent: smdoPackage.dateSent,
          headerId: smdoPackage.headerId,
          type: "Входящий",
          status: "Новый",
          outNumber: smdoPackage?.body?.envelop?.body?.document?.regNumber?.value ?? null,
          outDate: smdoPackage?.body?.envelop?.body?.document?.regNumber?.regdate ?? null,
          idnumber: smdoPackage?.body?.envelop?.body?.document?.idnumber,
          result,
          ackType,
          error: smdoPackage?.body?.message,
        });
        if (!smdoPackage.from.idAbonent || isAck === true)
          await this.confirmOnePackageReceiving(smdoPackage.confirmId, manager);
        if (smdoPackage.from.idAbonent && isAck === false)
          await this.saveNewPackage(smdoPackage, manager);
      });
      wLogger.info(`${IDD}сохранение пакета c ID ${smdoPackage.id}: ок`);
    } catch (err) {
      wLogger.error(`${IDD}сохранение пакета c ID ${smdoPackage.id}`, err);
    }
  }

  // сохранение пакета
  async saveNewPackage(smdoPackage, manager) {
    let doc;
    // создание дока, или назначение уже существующегоwwwwww
    try {
      if (
        smdoPackage?.body?.envelop?.body?.addDocuments &&
        smdoPackage?.body?.envelop?.body?.document
      ) {
        doc = await this.createDoc(smdoPackage, manager);
      } else {
        if (smdoPackage?.body?.envelop?.body?.addDocuments?.folder) {
          const folders = smdoPackage.body.envelop.body.addDocuments.folder;
          for (const folder of folders) {
            // поиска дока по существующему idnumber - DONE
            const referredPackage = await manager.findOne(SmdoPackagesEntity, {
              where: { idnumber: folder.referred.idnumber },
            });

            doc = await manager.findOne(DocEntity, {
              where: { id: referredPackage.docId },
            });

            if (!doc) {
              customError(`${IDD}документ отсутствует`);
            }
          }
        } else {
          doc = await this.createDoc(smdoPackage, manager);
        }
      }
    } catch (err) {
      wLogger.error(`${IDD}сохранение пакета`, err, smdoPackage);
    }
    // сохранение файлов к документу
    try {
      await this.saveFiles(smdoPackage, doc, manager);
    } catch (err) {
      customError(`${IDD}сохранение файлов: ошибка`, err);
    }
    try {
      const findPackage = await manager.findOneBy(SmdoPackagesEntity, {
        smdoId: smdoPackage.id,
      });

      await manager.save(SmdoPackagesEntity, {
        id: findPackage.id,
        docId: doc.id,
        status: "Сохранён",
      });
    } catch (err) {
      customError(`${IDD}смена статуса на "Сохранен": ошибка`, err);
    }
    if (
      smdoPackage?.body?.envelop?.body?.addDocuments &&
      !smdoPackage?.body?.envelop?.body?.document
    )
      await this.sendAcknowledge(smdoPackage.id, "ADDITIONAL", manager);
    else await this.sendAcknowledge(smdoPackage.id, "RECEIVE", manager);
    await this.confirmOnePackageReceiving(smdoPackage.confirmId, manager);
  }

  // создание дока
  async createDoc(smdoPackage, manager = undefined) {
    const defaultLanguages = await manager.findOne(LanguageEntity, {
      select: {
        id: true,
        nm: true,
      },
      where: {
        char_code_en: "rus",
      },
    });

    let tdoc = await manager.findOne(TdocEntity, {
      where: { nm: smdoPackage?.body?.envelop?.body?.document?.kind },
    });

    if (!tdoc)
      tdoc = await manager.save(TdocEntity, {
        nm: smdoPackage?.body?.envelop?.body?.document?.kind,
        temp: false,
      });

    let org = await manager.findOne(OrgEntity, {
      where: { smdocode: smdoPackage?.body?.envelop?.header?.sender?.id },
    });

    if (!org) org = await this.createOrg(smdoPackage, manager);
    let signed =
      smdoPackage?.body?.envelop?.body?.document?.author[0]?.organizationWithSign
        ?.officialPersonWithSign[0]?.name?.value;
    if (!signed || signed === "null") signed = null;
    const newDoc = manager.create(DocEntity, {
      author: null,
      org_id: org.id ?? null,
      author_name:
        smdoPackage?.body?.envelop?.body?.document?.author[0]?.organizationWithSign?.shortname,
      del: false,
      delivery: DeliveryEnum.SMDO,
      signed,
      tdoc: tdoc?.id ?? 1,
      body: `Входящий документ СМДО от ${smdoPackage?.body?.envelop?.header?.sender?.name}`,
      nt: smdoPackage?.body?.envelop?.body?.document?.title,
      pg: smdoPackage?.body?.envelop?.body?.document?.pages?.toString(),
      outd: smdoPackage?.body?.envelop?.body?.document?.regNumber?.regdate,
      outnum: smdoPackage?.body?.envelop?.body?.document?.regNumber?.value,
      docstatus: DocStatus.NEWDOC.id,
      languages: [{ label: defaultLanguages.nm, id: defaultLanguages.id }],
      cls_id: 1,
    });

    const { id } = await manager.save(DocEntity, newDoc);

    await manager.save(CorrespondentEntity, {
      doc_id: id,
      org: org.id,
      delivery_id: 8,
    });

    const docParent = smdoPackage?.body?.envelop?.body?.document?.docParent;
    if (docParent) {
      try {
        await manager.save(RelEntity, {
          rel_types_id: 1,
          doc_direct_id: newDoc.id,
          doc_reverse_id: docParent.idnumber.split("_")[1],
        });
      } catch (err) {
        wLogger.error(`${IDD}создание связки по idnumber: ${docParent?.idnumber}`, err);
      }
    }
    return await manager.findOneBy(DocEntity, { id });
  }

  // создание организации
  async createOrg(smdoPackage, manager) {
    const abonent = await manager.findOne(SmdoAbonentsEntity, {
      where: { smdoCode: smdoPackage?.body?.envelop?.header?.sender?.id },
    });

    let city = abonent.address.split(".")[1].trim().split(" ")[0];

    if (city.endsWith(",")) city = city.slice(0, -1);
    let region = await manager.findOne(RegionEntity, { where: { nm: city } });

    if (!region) {
      region = await manager.save(RegionEntity, {
        nm: city,
      });
    }

    return manager.save(OrgEntity, {
      nm: abonent.brandName ?? abonent.fullName,
      fnm: abonent.fullName,
      region: region.id,
      smdocode: smdoPackage.body.envelop.header.sender.id,
      smdoId: smdoPackage.from.idAbonent,
    });
  }

  // удаление существующего файла при замене
  async deleteExistedFileWhenReplace(fileName, document, manager) {
    const fileBlockEntity = await manager.find(FileBlockEntity, {
      relations: {
        FileVersions: {
          FileItems: true,
        },
      },
      where: { doc_id: document.id },
    });

    for (const block of fileBlockEntity) {
      if (block.FileVersionMain.note === "Заменен") continue;
      const name = block.FileVersionMain.name;
      const ext = block.FileVersionMain.FileItemMain.ext;
      const fileNameDB = `${name}.${ext}`;

      if (fileName === fileNameDB)
        await manager.save(FileVersionEntity, {
          id: block.FileVersionMain.id,
          note: "Заменен",
        });

      // new FileDeleteService(this.dataSource).deleteFileVersion(block.FileVersionMain.id);
    }
  }

  // сохранение файлов
  async saveFiles(smdoPackage, newDoc, manager) {
    for (const attachment of smdoPackage.attachments) {
      const file = await this.getPackageAttachment(smdoPackage.id, attachment.id);
      if (!file) continue;

      let fileDescription = "Основной";
      const body = smdoPackage.body.envelop.body;

      let docFile = { name: "unknown.txt", description: "Не найдено название файла" };
      if (body.addDocuments && body.addDocuments.folder) {
        for (const folder of body.addDocuments.folder) {
          for (const transfer of folder.docTransfer) {
            if (transfer.data.referenceid === attachment.name) {
              docFile = transfer;
              if (folder.add_type === 0) fileDescription = "Приложение документа";
              else if (folder.add_type === 1) fileDescription = "Дополнение";
              else if (folder.add_type === 2) {
                fileDescription = "Замена";
                await this.deleteExistedFileWhenReplace(docFile.name, newDoc, manager);
              }
            }
          }
        }
      }
      if (body.document && body.document.docTransfer) {
        for (const docTransfer of body.document.docTransfer) {
          if (docTransfer.data.referenceid === attachment.name) {
            docFile = docTransfer;
            fileDescription = "Основной";
          }
        }
      }

      // сохранить файл в хранилище VOLUME
      const date_create = new Date();
      const volume = uuidv4();
      const filePath = getPathVolume(
        this.org,
        date_create,
        volume,
      );
      await writeFileVolume({
        stream: file,
        filePath: filePath,
        compress: FILE.VOLUME.COMPRESS_DEFAULT,
      });

      // создать запись в БД
      const fileBlock = await manager.create(FileBlockEntity, {
        doc_id: newDoc.id,
      });
      const fileBlockSaved = await manager.save(FileBlockEntity, fileBlock);

      // логика примечания
      const note = docFile.description ?? fileDescription;
      await fileDBCreateMain({
        manager,
        block: {
          file_block_id: fileBlockSaved.id,
        },
        version: {
          file_name: docFile.name, // заменить имя
          note, // поставить description
          emp_id: null,
          task_pdf_create: FILE.DB.PDF_CREATE_DEFAULT,
        },
        item: {
          volume: volume,
          date_create: date_create,
          compress: FILE.VOLUME.COMPRESS_DEFAULT,
        },
        sign: attachment.sign[0].data,
      });
    }
  }

  // отправка квитанции о получении
  async sendAcknowledge(packageId: string, ackTypeCode = "RECEIVE", manager = undefined) {
    let smdoPackage;
    let abonent;
    let me;
    let document;
    if (!manager) {
      smdoPackage = await this.packagesRepository.findOneBy({ smdoId: packageId });
      abonent = await this.abonentsRepository.findOneBy({
        smdoId: smdoPackage.fromAbonentId,
      });
      document = await this.docRepository.findOneBy({ id: smdoPackage.docId });
      me = await this.abonentsRepository.findOneBy({
        smdoCode: this.gs[SETTING_CONST.SMDO_CODE.nm],
      });
    } else {
      smdoPackage = await manager.findOneBy(SmdoPackagesEntity, { smdoId: packageId });
      abonent = await manager.findOneBy(SmdoAbonentsEntity, {
        smdoId: smdoPackage.fromAbonentId,
      });
      document = await manager.findOneBy(DocEntity, { id: smdoPackage.docId });
      me = await manager.findOneBy(SmdoAbonentsEntity, {
        smdoCode: this.gs[SETTING_CONST.SMDO_CODE.nm],
      });
    }
    let ackText = "Документ доставлен в систему документооборота";
    let ackType = 1;
    let errorcode = 0;
    let subject = `Уведомление о доставке документа №${smdoPackage.body.envelop.subject}`;

    if (ackTypeCode === "ADDITIONAL") {
      subject = `Уведомление о получении дополнительных материалов к документу №${smdoPackage.body.envelop.subject}`;
      ackText = "Дополнительные материалы получены";
      ackType = 1;
    }

    if (ackTypeCode === "ACCEPT") {
      try {
        ackText = `Документ зарегистрирован в системе документооборота ${document.reg_num} от ${
          document?.dr
            ? dayjs(document?.dr).format("DD/MM/YYYY")
            : dayjs(new Date()).format("DD/MM/YYYY")
        }`;
      } catch (e) {
        ackText = `Документ зарегистрирован в системе документооборота ${document.reg_num}}`;
      }
      subject = `Уведомление о регистрации документа №${smdoPackage.body.envelop.subject}`;
      ackType = 2;
    }

    if (ackTypeCode === "REJECT") {
      // ackText = "Документ не прошел регистрацию в системе документооборота";
      ackText = `Отказ в регистрации: ${document?.short_note}`;
      subject = `Уведомление об отказе в регистрации документа №${smdoPackage.body.envelop.subject}`;
      ackType = 2;
      errorcode = 2;
    }

    if (ackTypeCode === "DECLINE") {
      ackText = "Документ не подлежит регистрации в системе документооборота";
      subject = `Уведомление: Документ №${smdoPackage.body.envelop.subject} не подлежит регистрации. Причина: ${document.short_note}`;
      ackType = 2;
      errorcode = 1;
    }

    const receiver = smdoPackage.body.envelop.header.sender;
    if (!receiver.organization) {
      receiver.organization = {
        organization_string: abonent.fullName,
        fullname: abonent.fullName,
        shortname: abonent.abbreviatedName,
      };
    }

    const sender = smdoPackage.body.envelop.header.receiver[0];
    if (sender.organization) {
      (sender.sys_id = this.gs[SETTING_CONST.SMDO_SYSTEM_ID.nm]),
        (sender.system = this.gs[SETTING_CONST.SMDO_SYSTEM.nm]),
        (sender.system_details =
          this.gs[SETTING_CONST.SMDO_SYSTEM_DETAILS.nm]),
        delete sender.organization;
      delete sender.referred;
      delete sender.privatePerson;
    }

    if (!receiver.organization) {
      receiver.organization = {
        organization_string: abonent.fullName,
        fullname: abonent.fullName,
        shortname: abonent.abbreviatedName,
      };
    }

    const ackBody = {
      to: [
        {
          idAbonent: abonent.smdoId,
          typeAbonent: "SMDO",
          name: abonent.brandName,
          orgId: abonent.id,
          applicationId: smdoPackage.toAbonentId,
        },
      ],
      dateSent: new Date(),
      parentId: packageId,
      body: {
        envelop: {
          header: {
            sender,
            msg_type: 0,
            receiver: [receiver],
            msg_acknow: 0, // отсутсвие необходимости посылки уведомлений
          },
          body: {
            acknowledgement: {
              msg_id: smdoPackage.body.envelop.msg_id,
              ack_type: ackType,
              ackResult: [
                {
                  value: ackText,
                  errorcode,
                },
              ],
              regNumber: {
                value: `${document.outnum}`,
                regdate: `${new Date(document.outd).toISOString().split("T")[0]}`,
              },
              incNumber: null,
            },
          },
          type: "SDIP-2.1.1",
          msg_id: uuidv4(),
          dtstamp: this.timestampWithoutMilliseconds(),
          subject,
        },
      },
    };

    if (ackTypeCode === "ACCEPT") {
      ackBody.body.envelop.body.acknowledgement.incNumber = {
        value: `${document.reg_num}`,
        regdate: `${new Date(document.dtc).toISOString().split("T")[0]}`,
      };
    }

    if (ackTypeCode === "REJECT") {
      ackBody.body.envelop.body.acknowledgement.incNumber = {
        value: `Отказ от регистрации`,
        regdate: `${new Date().toISOString().split("T")[0]}`,
      };
    }

    if (ackTypeCode === "DECLINE") {
      ackBody.body.envelop.body.acknowledgement.incNumber = {
        value: `Не подлежит регистрации`,
        regdate: `${new Date().toISOString().split("T")[0]}`,
      };
    }

    const result = await axios.post(
      this.url_pack(),
      ackBody,
      await this.req_timeout(),
    );
    if (result.status === 200 || result.status === 201) {
      const smdoPackageNew = await this.getPackage(result.data.packageId);
      let ackType = null;

      if (smdoPackageNew?.body?.envelop?.body?.acknowledgement?.ack_type === 1)
        ackType = "Доставка";
      else if (smdoPackageNew?.body?.envelop?.body?.acknowledgement?.ack_type === 2)
        ackType = "Регистрация";
      let resultValue = null;

      if (smdoPackageNew?.body?.envelop?.body?.acknowledgement?.askResult?.length > 0)
        resultValue = smdoPackageNew?.body?.envelop?.body?.acknowledgement?.askResult[0].value;
      const body = {
        smdoId: smdoPackageNew?.packageId,
        fromAbonentId: me?.smdoId,
        toAbonentId: abonent?.smdoId,
        ack: true,
        smdoParentId: smdoPackageNew?.parentId,
        body: smdoPackageNew.body,
        dateIn: new Date().toISOString(),
        dateSent: smdoPackageNew?.dateSent,
        headerId: smdoPackageNew?.headerId,
        type: "Исходящий",
        status: "Новый",
        // новые поля
        outNumber: smdoPackageNew?.body?.document?.regNumber?.value ?? null,
        outDate: smdoPackageNew?.body?.document?.regNumber?.regdate ?? null,
        inNumber: document.reg_num ?? null,
        inDate: document.dr ?? null,
        result: resultValue,
        ackType,
        error: smdoPackageNew?.body?.message,
      };
      if (!manager) {
        await this.packagesRepository.save(body);
      }
      await manager.save(SmdoPackagesEntity, body);

      await this.sendPackage(smdoPackageNew.packageId, manager);
    } else return { status: result.status };
  }

  // получение неотправленного пакета
  async getPackage(packageId: string) {
    if (!packageId) customError(`${IDD}введите ID пакета`);
    const result = await axios.get(
      `${this.url_pack()}/${packageId}`,
      await this.req_timeout(),
    );
    if (result.status === 200) {
      return result.data;
    } else customError(`${IDD}ошибка`);
  }

  // обновление неотправленного пакета
  async updatePackage(packageId: string, body) {
    if (!packageId) customError(`${IDD}введите ID пакета`);
    const result = await axios.put(
      this.url_pack(),
      body,
      await this.req_timeout(),
    );
    if (result.status === 200) {
      return result.data;
    } else return { status: 400, message: "Ошибка" };
  }

  // получить вложение пакета
  async getPackageAttachment(packageId, attachId) {
    if (!packageId) customError(`${IDD}введите ID пакета`);
    if (!attachId) customError(`${IDD}введите ID вложения`);

    const token = await this.getToken();

    try {
      const response = await axios.get(
        `${this.gs[SETTING_CONST.SMDO_URL.nm]}sender/1.0.0/org/SMDO~1.0.0/package/${packageId}/attach/${attachId}`,
        {
          ...await this.req_timeout(),
          responseType: "stream",
        },
      );

      if (response.status === 200) {
        return response.data; // Return the response stream
      } else {
        return { status: 400, message: "Ошибка" };
      }
    } catch (err) {
      // Handle error
      customError(`${IDD}получение вложения пакета`, err);
    }
  }

  // подтвердить получение одного пакета
  async confirmOnePackageReceiving(confirmId: string, manager = undefined) {
    if (!confirmId) customError(`${IDD}Введите ID пакета`);
    const result = await axios.get(
      `${this.gs[SETTING_CONST.SMDO_URL.nm]}sender/1.0.0/org/SMDO~1.0.0/package/confirm/${confirmId}`,
      await this.req_timeout(),
    );
    if (result.status === 204 && manager === undefined) {
      const findPackage = await this.packagesRepository.findOneBy({
        confirmId,
      });
      await this.packagesRepository.save({ id: findPackage.id, status: "Подтверждён" });
      return { status: 204, message: "Получение пакета подтверждено" };
    } else if (result.status === 204 && manager) {
      const findPackage = await manager.findOneBy(SmdoPackagesEntity, { confirmId });
      await manager.save(SmdoPackagesEntity, { id: findPackage.id, status: "Подтверждён" });
      return { status: 204, message: "Получение пакета подтверждено" };
    } else customError(`${IDD}ошибка`);
  }

  // подтвердить получение пачки пакетов
  async confirmManyPackageReceiving(ids) {
    if (!ids || (ids && !Array.isArray(ids)) || (ids && Array.isArray(ids) && ids.length === 0))
      customError(`${IDD}неверный запрос`);
    const result = await axios.post(
      `${this.gs[SETTING_CONST.SMDO_URL.nm]}sender/1.0.0/org/SMDO~1.0.0/package/confirm/batch`,
      { ids },
      await this.req_timeout(),
    );
    if (result.status === 204) {
      return { status: 204, message: "Получение пакетов подтверждено" };
    } else customError(`${IDD}ошибка`);
  }

  // оставновить работу СМДО
  stopSmdoCronJobs(): void {
    const smdoJobs = this.gs[GS_DOP.JOBS] || [];
    for (const job of smdoJobs) {
      job.stop();
    }
    this.gs[GS_DOP.JOBS] = [];
  }

  // поведение синхронизации при старте сервера
  async smdoOnStartBehaviour(): Promise<void> {
    if (
      !getSettingsValBool({
        org: this.org,
        key: SETTING_CONST.SMDO_ENABLED.nm,
      })
    ) {
      this.stopSmdoCronJobs();
      return;
    }
    try {
      if (this.gs[GS_DOP.JOBS]?.length > 0) return;
      this.gs[GS_DOP.JOBS] = [];
      const syncJob = cron.schedule(
        this.gs[SETTING_CONST.SMDO_SYNCRHONIZE_SHEDULER.nm],
        async () => {
          try {
            wLogger.info(`${IDD}обновление справочников: старт`);
            await this.synchronizeSmdo();
            wLogger.info(`${IDD}обновление справочников: ок`);
          } catch (err) {
            wLogger.error(`${IDD}обновление справочников`, err);
          }
        },
      );
      const packagesJob = cron.schedule(
        this.gs[SETTING_CONST.SMDO_SYNCRHONIZE_PACKAGES_SCHEDULER.nm],
        async () => {
          try {
            wLogger.info(`${IDD}получение списка пакетов: старт`);
            await this.getPackageList();
            wLogger.info(`${IDD}получение списка пакетов: ок`);
          } catch (err) {
            wLogger.error(`${IDD}получение списка пакетов`, err);
          }
        },
      );
      const stackJob = cron.schedule("* * * * *", async () => {
        try {
          await this.sendPackagesFromStack();
        } catch (err) {
          wLogger.error(`${IDD}отправка писем из очереди`, err);
        }
      });
      this.gs[GS_DOP.JOBS].push(
        syncJob,
        packagesJob,
        stackJob,
      );
    } catch (err) {
      this.stopSmdoCronJobs();
      wLogger.error(`${IDD}`, err);
    }
  }

  // первичная и повторная отправка пакетов из очереди
  async sendPackagesFromStack(): Promise<void> {
    const smdoStackEntityList = await this.stackRepository.find({
      where: { is_active: true },
    });
    for (const smdoStackEntity of smdoStackEntityList) {
      let delayTime = Number(this.gs[SETTING_CONST.SMDO_SEND_REPEAT.nm]);
      if (!smdoStackEntity.send_time) {
        delayTime = Number(this.gs[SETTING_CONST.SMDO_SEND_DELAY.nm]);
        smdoStackEntity.send_time = smdoStackEntity.dtc;
      }
      const currentDate = new Date();
      const timeDifferenceMs = currentDate.getTime() - smdoStackEntity.send_time.getTime();
      const timeDifferenceMinutes = Math.floor(timeDifferenceMs / (1000 * 60));
      if (timeDifferenceMinutes < delayTime) continue;
      const body = smdoStackEntity?.body;
      try {
        await this.createAndSendPackage(
          body.corrIds,
          body.documentId,
          body.addDocuments,
          body.files,
          false,
        );
        await this.stackRepository.delete({ id: smdoStackEntity.id });
        wLogger.info(`${IDD}документ id=${body.documentId} отправлен по СМДО`);
      } catch (err) {
        // найти запись в логах
        let smdoPackagesEntity = await this.packagesRepository.findOneBy({
          smdo_stack_id: smdoStackEntity.id,
        });
        // создать или изменить запись
        const rec = {
          dateIn: currentDate,
          dateSent: currentDate,
          result: errWithoutPref(err?.message) ?? 'Ошибка формирования пакета',
          error: errWithoutPref(err?.message) ?? 'Ошибка формирования пакета',
          status: 'Ошибка',
        };
        if (!smdoPackagesEntity) {
          smdoPackagesEntity = this.packagesRepository.create({
            ...rec,
            smdo_stack_id: smdoStackEntity.id,
            docId: body?.documentId,
            outNumber: smdoStackEntity.regNum,
          });
          await this.packagesRepository.save(smdoPackagesEntity);
        } else {
          this.packagesRepository.update(
            { smdo_stack_id: smdoStackEntity.id },
            rec
          );
        }
        // if (!isPrefErr(err)) {
        //   wLogger.error(`${IDD}ошибка отправки пакета документ id=${smdoPackagesEntity?.docId}`, err);
        // }
      }
    }
  }

  // синхронизация данных
  async synchronizeSmdo(): Promise<void> {
    try {
      wLogger.info(`${IDD}синхронизация данных: старт`);
      await this.getFileTypes();
      await this.getDocumentTypes();
      await this.getSedList();
      await this.getAbonents();
      wLogger.info(`${IDD}синхронизация данных: ок`);
    } catch (err) {
      wLogger.error(`${IDD}синхронизация данных`, err);
    }
  }

  // обновление справочника
  async updateSmdoInfo(name: string): Promise<void> {
    if (!name) customError(`${IDD}введите имя справочника`);
    let result = false;
    try {
      switch (name) {
        case "file-types":
          result = await this.getFileTypes();
          break;
        case "document-types":
          result = await this.getDocumentTypes();
          break;
        case "sed-list":
          result = await this.getSedList();
          break;
        case "abonents":
          await this.getFileTypes();
          await this.getDocumentTypes();
          await this.getSedList();
          this.getAbonents();
          result = true;
          break;
        default:
          customError(`${IDD}неверные данные`);
      }
    } catch (err) {
      wLogger.error(`${IDD}ошибка обновления справочника ${name}`, err);
    }
    if (result === false) customError(`${IDD}ошибка обновления справочника ${name}`);
  }

  // получение справочников типов документов
  async getDocumentTypes(): Promise<boolean> {
    const result = await axios.get(
      `${this.gs[SETTING_CONST.SMDO_URL.nm]}smdo_nsi_doc_type/1.0.0/smdo_nsi/doc_type/v1`,
      await this.req_header(),
    );
    if (result.status === 200) {
      wLogger.info(`${IDD}получен справочник типов документов, запись в базу: старт`);
      await this.docTypesRepository.clear();
      for (const document of result.data) {
        await this.docTypesRepository.save({
          smdoId: document.id,
          rowId: document.rowId,
          //   endDate: document.endDate,
          status: document.status,
          docCode: document.docCode,
          updatedOn: document.updatedOn,
          objId: document.objid,
          name: document.name,
          //    startDate: document.startDate,
          createdOn: document.createdOn,
        });
      }
      wLogger.info(`${IDD}получен справочник типов документов, запись в базу: ок`);
      return true;
    } else return false;
  }

  // получение справочника типов файлов
  async getFileTypes(): Promise<boolean> {
    const result = await axios.get(
      `${this.gs[SETTING_CONST.SMDO_URL.nm]}smdo_nsi_file_type/1.0.0/smdo_nsi/file_type/v1`,
      await this.req_header(),
    );
    if (result.status === 200) {
      wLogger.info(`${IDD}получен справочник типов файлов, запись в базу: старт`);
      await this.fileTypesRepository.clear();
      for (const file of result.data) {
        await this.fileTypesRepository.save({
          smdoId: file.id,
          rowId: file.rowId,
          //  endDate: file.endDate,
          status: file.status,
          extension: file.extension,
          updatedOn: file.updatedOn,
          objId: file.objid,
          name: file.name,
          //  startDate: file.startDate,
          createdOn: file.createdOn,
        });
      }
      wLogger.info(`${IDD}получен справочник типов файлов, запись в базу: ок`);
      return true;
    } else return false;
  }

  // получение справочника ведомственных СЭД
  async getSedList(): Promise<boolean> {
    const result = await axios.get(
      `${this.gs[SETTING_CONST.SMDO_URL.nm]}smdo_nsi_sed_type/1.0.0/smdo_nsi/sed_type/v1`,
      await this.req_header(),
    );
    if (result.status === 200) {
      wLogger.info(`${IDD}получен справочник межведомственных СЭД, запись в базу: старт`);
      await this.sedListRepository.clear();
      for (const sed of result.data) {
        await this.sedListRepository.save({
          smdoId: sed.id,
          rowId: sed.rowId,
          //    endDate: sed.endDate,
          status: sed.status,
          description: sed.description,
          certified: sed.certified,
          updatedOn: sed.updatedOn,
          objId: sed.objid,
          name: sed.name,
          //    startDate: sed.startDate,
          createdOn: sed.createdOn,
        });
      }
      wLogger.info(`${IDD}получен справочник межведомственных СЭД, запись в базу: ок`);
      return true;
    } else return false;
  }

  // получение справочника абонентов СМДО
  async getAbonents(page = 1): Promise<boolean> {
    const limit = 1000;
    let result;
    try {
      result = await axios.post(
        `${this.gs[SETTING_CONST.SMDO_URL.nm]}smdo_nsi_subscriber/1.0.0/smdo_nsi/subscriber/v1/search`,
        {
          paging: {
            page: page,
            limit: limit,
          },
        },
        await this.req_timeout(),
      );
    } catch (err) {
      customError(`${IDD}отсутствует соединение`, err);
    }

    if (result.status === 200) {
      wLogger.info(`${IDD}получен справочник абонентов, запись в базу: старт`);
      for (const sed of result.data.data) {
        if (!sed?.organization?.id) continue;
        const current = await this.abonentsRepository.findOne({
          where: { smdoId: sed.organization.id },
        });
        if (current) {
          await this.abonentsRepository.update(
            { smdoId: sed.organization.id }, // Condition for update
            {
              rowId: sed.rowId,
              status: sed.status,
              smdoCode: sed.smdoCode,
              authorityRegistered: sed.organization?.authorityRegistered?.ru,
              abbreviatedName: sed.organization?.abbreviatedName?.ru,
              egrStatus: sed.organization?.egrStatus?.name,
              orgType: sed.organization?.orgType?.name,
              subscriberStatus: sed.subscriberStatus,
              brandName: sed.organization?.brandName?.ru,
              address: sed.organization?.address?.ru,
              fullName: sed.organization?.fullName?.ru,
              updatedOn: sed.updatedOn,
              objId: sed.objid,
              createdOn: sed.createdOn,
            },
          );
          continue;
        }
        await this.abonentsRepository.save({
          smdoId: sed.organization.id,
          rowId: sed.rowId,
          status: sed.status,
          smdoCode: sed.smdoCode,
          authorityRegistered: sed.organization?.authorityRegistered?.ru,
          abbreviatedName: sed.organization?.abbreviatedName?.ru,
          egrStatus: sed.organization?.egrStatus?.name,
          orgType: sed.organization?.orgType?.name,
          subscriberStatus: sed.subscriberStatus,
          brandName: sed.organization?.brandName?.ru,
          address: sed.organization?.address?.ru,
          fullName: sed.organization?.fullName?.ru,
          updatedOn: sed.updatedOn,
          objId: sed.objid,
          createdOn: sed.createdOn,
        });
      }
      if (result.data.paging.hasNext) {
        const nextPage = page + 1;
        wLogger.info(`${IDD}получен справочник абонентов, запись в базу: страница ${page}`);
        await this.getAbonents(nextPage);
      }
      wLogger.info(`${IDD}получен справочник абонентов, запись в базу: ок`);
      return true;
    } else return false;
  }

  // получение токена
  async getToken(): Promise<string> {
    const now = new Date();
    const token = `${this.gs[SETTING_CONST.SMDO_USERNAME.nm]}:${this.gs[SETTING_CONST.SMDO_PASSWORD.nm]}`;

    const encodedToken = Buffer.from(token).toString("base64").trim();
    // отключено т.к. this.gs[GS_DOP.TOKEN_BASE64] не используется
    // const base64credentials = this.gs[GS_DOP.TOKEN_BASE64];
    // if (base64credentials) { encodedToken = base64credentials; }
    if (!this.gs[GS_DOP.TOKEN_EXP]) { this.gs[GS_DOP.TOKEN_EXP] = '01-01-1970'; }

    if (
      new Date(this.gs[GS_DOP.TOKEN_EXP]) < now
    ) {
      let result;
      try {
        // wLogger.info(`${IDD}encoded token: ${encodedToken}`);
        result = await axios.post(
          `${this.gs[SETTING_CONST.SMDO_URL.nm]}token?scope=application&grant_type=client_credentials`,
          null,
          {
            headers: { Authorization: "Basic " + encodedToken },
          },
        );
      } catch (err) {
        customError(`${IDD}отсутствует соединение`, err);
      }

      if (result.status === 200) {
        this.gs[GS_DOP.TOKEN_VAL] = result.data.access_token;
        this.gs[GS_DOP.TOKEN_EXP] = new Date(
          Date.now() + result.data.expires_in * 1000,
        ).toISOString();
        return result.data.access_token;
      } else {
        // wLogger.info(`${IDD} ${result.status} ${result.data}`);
      }
    }
    return this.gs[GS_DOP.TOKEN_VAL];
  }

  // проверка токена
  async checkToken(): Promise<any> {
    const token = `${this.gs[SETTING_CONST.SMDO_USERNAME.nm]}:${
      this.gs[SETTING_CONST.SMDO_PASSWORD.nm]
    }`;
    const encodedToken = Buffer.from(token).toString("base64").trim();
    // отключено т.к. this.gs[GS_DOP.TOKEN_BASE64] не используется
    // const base64credentials = this.gs[GS_DOP.TOKEN_BASE64];
    // if (base64credentials) encodedToken = base64credentials;
    let result;
    try {
      wLogger.info(`${IDD}encoded token: ${encodedToken}`);
      result = await axios.post(
        `${this.gs[SETTING_CONST.SMDO_URL.nm]}token?scope=application&grant_type=client_credentials`,
        null,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + encodedToken,
          },
        },
      );
    } catch (err) {
      customError(`${IDD}отсутствует соединение`, err);
    }
    if (result.status === 200) {
      this.gs[GS_DOP.TOKEN_VAL] = result.data.access_token;
      this.gs[GS_DOP.TOKEN_EXP] = new Date(
        Date.now() + result.data.expires_in * 1000,
      ).toISOString();
      return {
        message: "Соединение с СМДО установлено",
        token: result.data.access_token,
      };
    } else {
      // wLogger.info(`${IDD} ${result.status} ${result.data}`);
    }
    customError(`${IDD}отсутствует соединение`);
  }
}
