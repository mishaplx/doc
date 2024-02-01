import fs from "fs";
import nodemailer from "nodemailer";
import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { deleteFileBlockMaskUtil } from "src/modules/file/fileDelete/fileDelete.utils";
import { IFileBlockMask } from "src/modules/file/utils/db/file.db.delete.utils";
import { Brackets, EntityManager, ILike, In, SelectQueryBuilder } from "typeorm";
import zlib from "zlib";

import { DocStatus, DocumentTypes, PartiesDocs } from "../doc.const";
import {
  FORWARDING_STATUS,
  FORWARDING_VIEW,
  OrderDocEnum,
  SortEnum,
} from "../../../common/enum/enum";
import { IAttachmentsForSendMail } from "../../../common/interfaces/doc.interface";
import { IWhereFindAllJobCtrType } from "../../../common/interfaces/jobCtlType.interface";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";
import { DocPackageEntity } from "../../../entity/#organization/docPackage/docPackage.entity";
import { deleteInnerInventoryDocPackage } from "../../docPackage/docPackage.utils";
import { GetJobCtrTypeArgs } from "../../job/jobControlTypes/dto/get-jobCtrType.args";
import { GetDocumentsArgs } from "../dto/get-documents.args";
import { OrderDocInput } from "../dto/order-doc-request.dto";
import { getSettingsList } from "src/modules/settings/settings.util";
import { SETTING_CONST } from "src/modules/settings/settings.const";

const EMAIL_HOST = SETTING_CONST.EMAIL_HOST.nm;
const EMAIL_PORT = SETTING_CONST.EMAIL_PORT.nm;
const EMAIL_HOST_USER = SETTING_CONST.EMAIL_USER.nm;
const EMAIL_HOST_PASSWORD = SETTING_CONST.EMAIL_PASS.nm;
const EMAIL_FROM = SETTING_CONST.EMAIL_FROM.nm;
const EMAIL_REJECT_UNAUTHORIZED = SETTING_CONST.EMAIL_AUTH.nm;
const EMAIL_IGNORE_TLS = SETTING_CONST.EMAIL_TLS_OFF.nm;

export const citizenSqlSelect = `(citizen.ln || ' ' || substring(citizen.nm for 1) || '.' || substring(citizen.mn for 1) || '.')`;

export function setQueryBuilderDoc(
  args: GetDocumentsArgs,
  orderBy: OrderDocInput,
  empId: number,
  queryBuilder: SelectQueryBuilder<DocEntity>,
): void {
  const {
    cls,
    docstatus,
    author,
    body,
    regNum,
    tdoc,
    dr,
    id,
    priv,
    citizen,
    outnum,
    outd,
    signed,
    header,
    nt,
    delivery,
    nmncl,
    doc_package_id,
    doc_package_index,
    doc_package_status,
    inventory_id,
    user,
  } = args;

  queryBuilder.addSelect(
    `
    CASE WHEN doc.isorg THEN (org.nm)
      ELSE ${citizenSqlSelect}
    END
  `,
    "citizen_order",
  );

  queryBuilder.leftJoinAndSelect("doc.Author", "Author");
  queryBuilder.leftJoinAndSelect("Author.User", "A_User");
  queryBuilder.leftJoinAndSelect("A_User.Staff", "A_staff");
  queryBuilder.leftJoinAndSelect("Author.post", "A_post");
  queryBuilder.leftJoinAndSelect("doc.Cls", "Cls");
  queryBuilder.leftJoinAndSelect("doc.Delivery", "Delivery");
  queryBuilder.leftJoinAndSelect("doc.Docstatus", "Docstatus", "Docstatus.del = false");
  queryBuilder.leftJoinAndSelect("doc.Exec", "Exec", "Exec.del = false");
  queryBuilder.leftJoinAndSelect("Exec.User", "E_User");
  queryBuilder.leftJoinAndSelect("E_User.Staff", "E_Staff");
  queryBuilder.leftJoinAndSelect("Exec.post", "E_post");
  queryBuilder.leftJoinAndSelect("doc.Forwarding", "Forwarding", "Forwarding.del = false");
  // queryBuilder.leftJoinAndSelect('doc.Nmncl', 'Nmncl', 'Nmncl.del = false');
  queryBuilder.leftJoinAndSelect("doc.Priv", "Priv", "Priv.del = false");
  queryBuilder.leftJoinAndSelect("doc.Tdoc", "Tdoc");
  queryBuilder.leftJoinAndSelect("doc.citizen", "citizen", "citizen.del = false");
  queryBuilder.leftJoinAndSelect("doc.org", "org", "org.del = false");
  queryBuilder.leftJoinAndSelect("doc.DocPackage", "DocPackage", "DocPackage.del = false");
  queryBuilder.leftJoinAndSelect(
    "DocPackage.Nomenclature",
    "Nomenclature",
    "Nomenclature.del = false",
  );
  queryBuilder.leftJoinAndSelect("DocPackage.Status", "Status", "Status.del = false");

  queryBuilder.where("doc.del = false");
  queryBuilder.andWhere("doc.temp = false");

  if (cls) {
    queryBuilder.andWhere("doc.cls_id = :cls", { cls });
  }
  if (header) {
    queryBuilder.andWhere("doc.header ILIKE :header", { header: `%${header}%` });
  }

  if (docstatus) {
    queryBuilder.andWhere("doc.docstatus = :docstatus", { docstatus });
  }

  if (id) {
    queryBuilder.andWhere(`doc.id in ('${id.join("', '")}')`);
  }

  if (author) {
    queryBuilder.andWhere(
      `(A_staff.ln || ' ' || substring(A_staff.nm for 1) || '.' || CONCAT(substring(A_staff.mn for 1)) || '. / ' || A_post.nm) ILIKE :author`,
      {
        author: `%${author}%`,
      },
    );
  }

  if (body) {
    queryBuilder.andWhere("doc.body ILIKE :body", { body: `%${body}%` });
  }

  if (regNum) {
    queryBuilder.andWhere("doc.reg_num ILIKE :regNum", {
      regNum: `%${regNum}%`,
    });
  }

  if (tdoc) {
    queryBuilder.andWhere("doc.tdoc = :tdoc", { tdoc });
  }

  if (dr) {
    queryBuilder.andWhere("doc.dr = :dr", { dr });
  }

  if (priv) {
    queryBuilder.andWhere("doc.priv = :priv", { priv });
  }

  if (citizen) {
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("doc.isorg = true AND org.nm ILIKE :citizen", {
          citizen: `%${citizen}%`,
        }).orWhere(`doc.isorg = false AND ${citizenSqlSelect} ILIKE :citizen`, {
          citizen: `%${citizen}%`,
        });
      }),
    );
  }

  if (outnum) {
    queryBuilder.andWhere("doc.outnum ILIKE :outnum", {
      outnum: `%${outnum}%`,
    });
  }

  if (outd) {
    queryBuilder.andWhere("doc.outd = :outd", { outd });
  }

  if (signed) {
    queryBuilder.andWhere("doc.signed ILIKE :signed", {
      signed: `%${signed}%`,
    });
  }

  if (nt) {
    queryBuilder.andWhere("doc.nt ILIKE :nt", { nt: `%${nt}%` });
  }

  if (delivery) {
    queryBuilder.andWhere("Delivery.nm ILIKE :delivery", {
      delivery: `%${delivery}%`,
    });
  }

  if (nmncl) {
    queryBuilder.andWhere("doc.nmncl = :nmncl", { nmncl });
  }

  if (doc_package_id) {
    queryBuilder.andWhere("doc.doc_package_id = :doc_package_id", {
      doc_package_id,
    });
  }

  if (doc_package_index) {
    queryBuilder.andWhere("Nomenclature.index ILIKE :doc_package_index", {
      doc_package_index: `%${doc_package_index}%`,
    });
  }

  if (doc_package_status) {
    queryBuilder.andWhere("DocPackage.status_id = :doc_package_status", {
      doc_package_status,
    });
  }

  if (inventory_id) {
    queryBuilder.andWhere("DocPackage.inventory_id = :inventory_id", {
      inventory_id,
    });
  }

  switch (user) {
    case PartiesDocs.AUTHOR:
      queryBuilder.andWhere("doc.author = :empId", { empId });
      break;
    case PartiesDocs.RECEIVER:
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(
            new Brackets((qb) => {
              qb.where("Forwarding.veiw_id = :veiw_id", {
                veiw_id: FORWARDING_VIEW.VEIW.id,
              })
                .andWhere("Doc.docstatus IN (:...docstatus)", {
                  docstatus: [DocStatus.REGISTRATE.id, DocStatus.INVIEW.id],
                })
                .andWhere("Forwarding.date_end_sender ISNULL");
            }),
          ).orWhere(
            new Brackets((qb) => {
              qb.where("Forwarding.veiw_id = :veiw_not_id", {
                veiw_not_id: FORWARDING_VIEW.NOT_VEIW.id,
              }).andWhere("Forwarding.status_id = :status_id", {
                status_id: FORWARDING_STATUS.STATUS_NOT_VEIW.id,
              });
            }),
          );
        }),
      );
      queryBuilder.andWhere("Forwarding.del = false");
      queryBuilder.andWhere("Forwarding.temp = false");
      queryBuilder.andWhere("Forwarding.emp_receiver = :empId", { empId });
      queryBuilder.andWhere("Forwarding.date_end_sender ISNULL");
      break;
  }

  getOrderAllDoc(queryBuilder, orderBy);
}

function getOrderAllDoc(queryBuilder: SelectQueryBuilder<DocEntity>, orderBy: OrderDocInput): void {
  if (!orderBy) {
    queryBuilder.orderBy("doc.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderDocEnum.author:
      queryBuilder.orderBy({
        "A_staff.ln": orderBy.sortEnum,
        "A_staff.nm": orderBy.sortEnum,
        "A_staff.mn": orderBy.sortEnum,
        "A_post.nm": orderBy.sortEnum,
      });
      break;
    case OrderDocEnum.body:
      queryBuilder.orderBy("doc.body", orderBy.sortEnum);
      break;
    case OrderDocEnum.regNum:
      queryBuilder.orderBy("doc.reg_num", orderBy.sortEnum);
      break;
    case OrderDocEnum.tdoc:
      queryBuilder.orderBy("Tdoc.nm", orderBy.sortEnum);
      break;
    case OrderDocEnum.dr:
      queryBuilder.orderBy("doc.dr", orderBy.sortEnum);
      break;
    case OrderDocEnum.priv:
      queryBuilder.orderBy("Priv.nm", orderBy.sortEnum);
      break;
    case OrderDocEnum.citizen:
      queryBuilder.orderBy("citizen_order", orderBy.sortEnum);
      break;
    case OrderDocEnum.outnum:
      queryBuilder.orderBy("doc.outnum", orderBy.sortEnum);
      break;
    case OrderDocEnum.outd:
      queryBuilder.orderBy("doc.outd", orderBy.sortEnum);
      break;
    case OrderDocEnum.signed:
      queryBuilder.orderBy("doc.signed", orderBy.sortEnum);
      break;
    case OrderDocEnum.nt:
      queryBuilder.orderBy("doc.nt", orderBy.sortEnum);
      break;
    case OrderDocEnum.delivery:
      queryBuilder.orderBy("Delivery.nm", orderBy.sortEnum);
      break;
    case OrderDocEnum.docstatus:
      queryBuilder.orderBy("Status.nm", orderBy.sortEnum);
      break;
    case OrderDocEnum.cls:
      queryBuilder.orderBy("Cls.nm", orderBy.sortEnum);
      break;
    case OrderDocEnum.doc_package_index:
      queryBuilder.orderBy("Nomenclature.index", orderBy.sortEnum);
      break;
    case OrderDocEnum.doc_package_status:
      queryBuilder.orderBy("Status.nm", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("doc.id", SortEnum.DESC);
  }
}

export function getWhereFindAllForward(args: GetJobCtrTypeArgs): IWhereFindAllJobCtrType {
  const where: IWhereFindAllJobCtrType = {};
  const { nm, doc_id } = args;

  where.del = false;
  where.temp = false;

  if (nm) {
    where.nm = ILike(`%${nm}%`);
  }
  if (doc_id) {
    where.id_doc = doc_id;
  }
  return where;
}

/**
 * Изменить порядковый номер документов в деле
 */
async function changeSerialNumberDocs(
  docPackages: DocPackageEntity[],
  manager: EntityManager,
): Promise<void> {
  const docPackagesIds = docPackages.map((dp) => dp.id);

  for await (const dpId of docPackagesIds) {
    const docs = await manager
      .createQueryBuilder(DocEntity, "doc")
      .select("doc.id")
      .where({ doc_package_id: dpId, del: false, temp: false })
      .orderBy("doc.serial_number", SortEnum.ASC)
      .getMany();

    let serialNumber = 0;
    for await (const doc of docs) {
      serialNumber += 1;
      await manager.update(DocEntity, doc.id, { serial_number: serialNumber });
    }
  }
}

/**
 * Исключить документы из дела
 */
export async function excludeDocsFromDocPackage(
  docs: DocEntity[],
  docPackages: DocPackageEntity[],
  manager: EntityManager,
): Promise<void> {
  const docIncomeAndInner: number[] = [];
  const docOutcome: number[] = [];

  docs.forEach((doc) => {
    if ([DocumentTypes.INCOME, DocumentTypes.INNER].includes(doc.cls_id)) {
      docIncomeAndInner.push(doc.id);
      return;
    }

    if (DocumentTypes.OUTCOME === doc.cls_id) {
      docOutcome.push(doc.id);
    }
  });

  await manager.update(
    DocEntity,
    {
      id: In(docIncomeAndInner),
    },
    {
      docstatus: DocStatus.DONE.id,
      doc_package_id: null,
      serial_number: null,
    },
  );

  await manager.update(
    DocEntity,
    {
      id: In(docOutcome),
    },
    {
      docstatus: DocStatus.REGISTRATE.id,
      doc_package_id: null,
      serial_number: null,
    },
  );

  const docsId = docs.map((doc) => doc.id);
  const files = await manager.find(FileItemEntity, {
    select: { id: true },
    where: {
      FileVersion: { FileBlock: { doc_id: In(docsId) } },
    },
  });
  const filesId = files.map((file) => file.id);

  // Изменяем порядковый номер в оставшихся документах
  await changeSerialNumberDocs(docPackages, manager);

  // Убираем признак файла: в деле
  await manager.update(
    FileItemEntity,
    { id: In(filesId) },
    { is_doc_package: false },
  );

  // Внутренняя опись и подпись по ней должны слетать,
  // если в дело добавляется или исключается документ
  await deleteInnerInventoryDocPackage(docPackages, manager);

  // Удаляем ркк док-тов
  for await (const docId of docsId) {
    // маска для идентификации файлового блока
    const mask: IFileBlockMask = {
      doc_id: docId,
      rkk: true,
    };

    await deleteFileBlockMaskUtil({
      manager: manager,
      mask: mask,
    });
  }
}

/**
 * Отправить документ по электронной почте
 */
export async function sendMail(args: {
  org: string;
  email: string;
  html: string;
  attachments: IAttachmentsForSendMail[];
  subject: string;
}): Promise<void> {
  const { org, email, html, attachments, subject } = args;
  const setting: Record<string, string> = getSettingsList({
    org: org,
    keys: [
      EMAIL_HOST,
      EMAIL_PORT,
      EMAIL_HOST_USER,
      EMAIL_HOST_PASSWORD,
      EMAIL_FROM,
      EMAIL_REJECT_UNAUTHORIZED,
      EMAIL_IGNORE_TLS,
    ],
  });

  if (
    !setting[EMAIL_PORT] ||
    !setting[EMAIL_HOST] ||
    !setting[EMAIL_HOST_USER] ||
    !setting[EMAIL_HOST_PASSWORD] ||
    !setting[EMAIL_FROM]
  ) {
    throw Error("Не заполнены все настройки исходящей почты");
  }

  const port = +setting[EMAIL_PORT];
  // true для 465, false для других портов
  const secure = port === 465;
  const rejectUnauthorized = setting[EMAIL_REJECT_UNAUTHORIZED] === "true";
  const ignoreTLS = setting[EMAIL_IGNORE_TLS] === "true";

  const transporter = nodemailer.createTransport({
    host: setting[EMAIL_HOST],
    port,
    secure,
    auth: {
      user: setting[EMAIL_HOST_USER],
      pass: setting[EMAIL_HOST_PASSWORD],
    },
    logger: true,
    transactionLog: true, // include SMTP traffic in the logs
    ignoreTLS,
    tls: { rejectUnauthorized },
  });

  const result = await transporter.sendMail({
    from: `<${setting[EMAIL_FROM]}>`,
    to: email,
    subject,
    html,
    attachments: attachments.map((att) => {
      const stream = att.stream ? att.stream : fs.createReadStream(att.content);
      const gunzip = zlib.createGunzip();
      // при отстутствии сжатия - вернуть поток
      return {
        filename: att.filename,
        content: att.compress ? stream.pipe(gunzip) : stream,
      };
    }),
  });

  if (result?.rejected?.[0]) {
    throw Error(`Невалидная почта: ${result.rejected}`);
  }
}

export const getCurrentUnitCode = async (docEntity: DocEntity): Promise<DocEntity> => {
  const author = await docEntity.Author;
  const unit = (await author?.unit) ?? null;

  if ((docEntity.unit_id !== null) && (unit)) {
    unit.code = (await docEntity.Unit)?.code;
  }
  return docEntity;
};
