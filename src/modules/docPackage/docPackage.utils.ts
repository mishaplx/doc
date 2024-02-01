import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { IfileForInnerInventory } from "src/common/interfaces/docPackage.interface";
import { customError } from "src/common/type/errorHelper.type";
import { DocEntity } from "src/entity/#organization/doc/doc.entity";
import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { Brackets, EntityManager, In, IsNull, SelectQueryBuilder } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { DocPackageStatus, OrderDocPackagesEnum, SortEnum } from "../../common/enum/enum";
import { DocPackageEntity } from "../../entity/#organization/docPackage/docPackage.entity";
import { deleteFileBlockMaskUtil } from "../file/fileDelete/fileDelete.utils";
import { streamToBuffer } from "../file/utils/file.common.utils";
import { getPathVolume, readFileVolume } from "../file/utils/file.volume.utils";
import { GetDocPackagesArgs } from "./dto/get-doc-packages.args";
import { OrderDocPackagesInput } from "./dto/order-doc-packages-request.dto";

export function setQueryBuilderDocPackage(
  args: GetDocPackagesArgs,
  orderBy: OrderDocPackagesInput,
  queryBuilder: SelectQueryBuilder<DocPackageEntity>,
): void {
  const {
    id,
    name,
    ind,
    article_id,
    term,
    storage_comment,
    nt,
    status_id,
    year,
    inventory_id,
    inventory_name,
    start_date,
    end_date,
    count_doc,
    count_file,
    for_include_inventory,
    for_include_act,
    include_act,
    in_act,
    include_inventory,
    in_inventory,
  } = args;

  queryBuilder.innerJoinAndSelect(
    "doc_package.Nomenclature",
    "Nomenclature",
    "Nomenclature.del = false",
  );
  queryBuilder.innerJoinAndSelect(
    "Nomenclature.MainParent",
    "MainParent",
    "MainParent.del = false",
  );
  queryBuilder.innerJoinAndSelect(
    "Nomenclature.Article",
    "Article",
    "Article.del = false AND Article.temp = false",
  );
  queryBuilder.innerJoinAndSelect("Article.term", "term", "term.del = false AND term.temp = false");
  queryBuilder.innerJoinAndSelect("doc_package.Status", "Status", "Status.del = false");
  queryBuilder.leftJoinAndSelect(
    "doc_package.Inventory",
    "Inventory",
    "Inventory.del = false AND Inventory.temp = false",
  );
  queryBuilder.leftJoinAndSelect("Inventory.Name", "InventoryName", "InventoryName.del = false");

  queryBuilder.where("doc_package.del = false");

  if (id) {
    queryBuilder.andWhere("doc_package.id = :id", { id });
  }

  if (name) {
    queryBuilder.andWhere("Nomenclature.name ILIKE :name", {
      name: `%${name}%`,
    });
  }

  if (ind) {
    queryBuilder.andWhere("Nomenclature.index ILIKE :ind", {
      ind: `%${ind}%`,
    });
  }

  if (article_id) {
    queryBuilder.andWhere("Nomenclature.article_id = :article_id", {
      article_id,
    });
  }

  if (term) {
    queryBuilder.andWhere("term.nm ILIKE :term", { term: `%${term}%` });
  }

  if (storage_comment) {
    queryBuilder.andWhere("Nomenclature.storage_comment ILIKE :storage_comment", {
      storage_comment: `%${storage_comment}%`,
    });
  }

  if (nt) {
    queryBuilder.andWhere("Nomenclature.nt ILIKE :nt", { nt: `%${nt}%` });
  }

  if (status_id) {
    queryBuilder.andWhere("doc_package.status_id = :status_id", { status_id });
  }

  if (year) {
    queryBuilder.andWhere("MainParent.name = :year", { year });
  }

  if (inventory_id) {
    queryBuilder.andWhere("doc_package.inventory_id = :inventory_id", {
      inventory_id,
    });
  }

  if (inventory_name) {
    queryBuilder.andWhere(
      `('№ ' || Inventory.number || ' за ' || Inventory.year || ' ' || InventoryName.nm) ILIKE :inventory_name`,
      {
        inventory_name: `%${inventory_name}%`,
      },
    );
  }

  if (start_date) {
    queryBuilder.andWhere("doc_package.start_date = :start_date", {
      start_date,
    });
  }

  if (end_date) {
    queryBuilder.andWhere("doc_package.end_date = :end_date", { end_date });
  }

  if (Number.isInteger(count_doc)) {
    queryBuilder.andWhere("doc_package.count_doc = :count_doc", { count_doc });
  }

  if (Number.isInteger(count_file)) {
    queryBuilder.andWhere("doc_package.count_file = :count_file", {
      count_file,
    });
  }

  if (for_include_inventory) {
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where(
          new Brackets((qb) => {
            qb.where("doc_package.inventory_id ISNULL").andWhere(
              "doc_package.status_id = :status_id_inner_inventory_sign",
              {
                status_id_inner_inventory_sign: DocPackageStatus.INNER_INVENTORY_SIGN,
              },
            );
          }),
        ).orWhere(
          new Brackets((qb) => {
            qb.where("doc_package.inventory_id = :inventory_id", {
              inventory_id: for_include_inventory,
            }).andWhere("doc_package.status_id = :status_id_include_in_inventory", {
              status_id_include_in_inventory: DocPackageStatus.INCLUDED_IN_INVENTORY,
            });
          }),
        );
      }),
    );
  }

  if (for_include_act) {
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where(
          new Brackets((qb) => {
            qb.where("doc_package.act_id ISNULL").andWhere(
              "doc_package.status_id = :status_id_inner_inventory_sign",
              {
                status_id_inner_inventory_sign: DocPackageStatus.INNER_INVENTORY_SIGN,
              },
            );
          }),
        ).orWhere(
          new Brackets((qb) => {
            qb.where("doc_package.act_id = :act_id", {
              act_id: for_include_act,
            }).andWhere("doc_package.status_id = :status_id_include_in_act", {
              status_id_include_in_act: DocPackageStatus.INCLUDED_IN_ACT,
            });
          }),
        );
      }),
    );
  }

  if (include_act) {
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where(
          new Brackets((qb) => {
            qb.where("doc_package.act_id ISNULL").andWhere(
              "doc_package.status_id = :status_id_inner_inventory_sign",
              {
                status_id_inner_inventory_sign: DocPackageStatus.INNER_INVENTORY_SIGN,
              },
            );
          }),
        );
      }),
    );
  }

  if (in_act) {
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("doc_package.act_id = :act_id", {
          act_id: in_act,
        }).andWhere("doc_package.status_id = :status_id_include_in_act", {
          status_id_include_in_act: DocPackageStatus.INCLUDED_IN_ACT,
        });
      }),
    );
  }

  if (include_inventory) {
    queryBuilder.andWhere("doc_package.status_id = :status_id_inner_inventory_sign", {
      status_id_inner_inventory_sign: DocPackageStatus.INNER_INVENTORY_SIGN,
    });
    queryBuilder.andWhere("doc_package.inventory_id ISNULL");
    queryBuilder.andWhere("doc_package.act_id ISNULL");
  }

  if (in_inventory) {
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("doc_package.inventory_id = :inventory_id", {
          inventory_id: in_inventory,
        }).andWhere("doc_package.status_id = :status_id_include_in_inventory", {
          status_id_include_in_inventory: DocPackageStatus.INCLUDED_IN_INVENTORY,
        });
      }),
    );
  }

  getOrderAllDocPackages(queryBuilder, orderBy);
}

function getOrderAllDocPackages(
  queryBuilder: SelectQueryBuilder<DocPackageEntity>,
  orderBy: OrderDocPackagesInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("doc_package.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderDocPackagesEnum.id:
      queryBuilder.orderBy("doc_package.id", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.ind:
      queryBuilder.orderBy("Nomenclature.index", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.name:
      queryBuilder.orderBy("Nomenclature.name", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.storage_comment:
      queryBuilder.orderBy("Nomenclature.storage_comment", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.nt:
      queryBuilder.orderBy("Nomenclature.nt", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.article_id:
      queryBuilder.orderBy("Article.nm", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.term:
      queryBuilder.orderBy("term.nm", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.status_id:
      queryBuilder.orderBy("Status.nm", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.year:
      queryBuilder.orderBy("MainParent.name", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.inventory_name:
      queryBuilder.orderBy({
        "Inventory.number": orderBy.sortEnum,
        "Inventory.year": orderBy.sortEnum,
        "InventoryName.nm": orderBy.sortEnum,
      });
      break;
    case OrderDocPackagesEnum.count_doc:
      queryBuilder.orderBy("doc_package.count_doc", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.count_file:
      queryBuilder.orderBy("doc_package.count_file", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.start_date:
      queryBuilder.orderBy("doc_package.start_date", orderBy.sortEnum);
      break;
    case OrderDocPackagesEnum.end_date:
      queryBuilder.orderBy("doc_package.end_date", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("doc_package.id", SortEnum.DESC);
  }
}

export async function deleteInnerInventoryDocPackage(
  docPackages: DocPackageEntity[],
  manager: EntityManager,
): Promise<void> {
  const innerInventoryIds: number[] = [];
  const docPackagesId = docPackages.map((dp) => dp.id);
  // Получаем инф-цию по документам и файлам
  if (docPackagesId[0]) {
    docPackages = await manager
      .createQueryBuilder(DocPackageEntity, "doc_package")
      .leftJoinAndSelect("doc_package.Docs", "Docs", "Docs.del = false AND Docs.temp = false")
      .where("doc_package.id IN(:...id)", { id: docPackagesId })
      .andWhere("doc_package.del = false")
      .getMany();

    for await (const dp of docPackages) {
      const dr: Date[] = [];
      const docsId: number[] = [];

      const docs = await dp.Docs;
      const countDoc = docs.length;
      docs.forEach((doc) => {
        dr.push(doc.dr);
        docsId.push(doc.id);
      });
      // Если остались док-ты, подсчитываем количество файлов - file_item.is_doc_package = true
      // Ркк учитывается в количестве файлов. Каждый документ в деле имеет ркк. - FileBlock.rkk = true
      const { countFile } = docsId[0]
        ? await manager
          .createQueryBuilder(FileItemEntity, "file_item")
          .select("COUNT(DISTINCT file_item.id)::int", "countFile")
          .leftJoin("file_item.FileVersion", "FileVersion")
          .leftJoin("FileVersion.FileBlock", "FileBlock")
          .where("FileBlock.doc_id IN (:...docsId)", { docsId })
          .andWhere(
            new Brackets((qb) => {
              qb.orWhere("file_item.is_doc_package = true");
              qb.orWhere("FileBlock.rkk = true");
            }),
          )
          .getRawOne()
        : { countFile: 0 };

      const startDate = dr[0]
        ? new Date(Math.min(...dr.map((date) => new Date(date).getTime())))
        : null;
      const endDate = dr[0]
        ? new Date(Math.max(...dr.map((date) => new Date(date).getTime())))
        : null;
      // Убираем связь с внутренней описью и обновляем статистику по документам
      await manager.update(
        DocPackageEntity,
        {
          id: dp.id,
        },
        {
          count_doc: countDoc,
          count_file: countFile,
          start_date: startDate,
          end_date: endDate,
          status_id: DocPackageStatus.NEW,
        },
      );

      // Удаляем старую внутреннюю опись
      await deleteFileBlockMaskUtil({
        manager: manager,
        mask: { doc_package_id: dp.id },
      });
    }
  }
}

export function getDocPackageForStatistics(
  ids: number[],
  manager: EntityManager,
): Promise<DocPackageEntity[]> {
  return manager
    .createQueryBuilder(DocPackageEntity, "doc_package")
    .select()
    .innerJoinAndSelect("doc_package.Nomenclature", "Nomenclature", "Nomenclature.del = false")
    .innerJoinAndSelect("Nomenclature.MainParent", "MainParent", "MainParent.del = false")
    .innerJoinAndSelect(
      "Nomenclature.Article",
      "Article",
      "Article.del = false AND Article.temp = false",
    )
    .innerJoinAndSelect("Article.term", "term", "term.del = false AND term.temp = false")
    .innerJoinAndSelect("doc_package.Docs", "Docs", "Docs.del = false AND Docs.temp = false")
    .leftJoinAndSelect("Docs.FileBlock", "FileBlock")
    .where({
      id: In(ids),
      inventory_id: IsNull(),
      act_id: IsNull(),
      status_id: DocPackageStatus.INNER_INVENTORY_SIGN,
    })
    .getMany();
}

/**
 * Проверка ркк на формат PDF
 */
export async function checkRkkFormatPDF(arrRkk: FileItemEntity[]): Promise<void> {
  const errors: string[] = [];
  for await (const rkk of arrRkk) {
    const regNumDoc = (await (await (await rkk?.FileVersion)?.FileBlock)?.Doc)?.reg_num;
    if (rkk?.task_pdf_format) {
      errors.push(`Документ Рег.№ ${regNumDoc}, происходит конвертация PDF ркк.`);
    } else if (!rkk?.pdf_format) {
      errors.push(`Документ Рег.№ ${regNumDoc}, ошибка конвертации PDF ркк.`);
    }
  }
  if (errors[0]) {
    customError(errors.join(' '));
  }
}

export async function getFilesForInnerInventory(
  org: string,
  docs: DocEntity[],
  manager: EntityManager,
): Promise<IfileForInnerInventory[]> {
  const data: IfileForInnerInventory[] = [];
  const errors: string[] = [];
  for await (const doc of docs) {
    // Получаем файлы и файл ркк.
    const files = await manager.find(
      FileItemEntity,
      {
        relations: {
          FileVersion: {
            FileBlock: {
              Doc: true,
            },
          },
        },
        where: [
          {
            FileVersion: { FileBlock: { doc_id: doc.id } },
            is_doc_package: true,
          },
          {
            FileVersion: { FileBlock: { doc_id: doc.id, rkk: true } },
          }
        ],
        order: { id: SortEnum.ASC },
      }
    );

    // Проверяем, есть ли ркк.
    let isRkk = false;
    // Подготавливаем файлы
    for await (const file of files) {
      const fileName = await (await file?.FileVersion)?.name;
      const path = getPathVolume(org, file.date_create, file.volume);
      // У ркк is_doc_package = false
      if (!file.is_doc_package) isRkk = true;
      try {
        const stat = await fsp.stat(path);
        // is_doc_package true - в файлах, false - ркк
        data.push({
          docId: doc?.id,
          path,
          rkk: file.is_doc_package === false,
          size: stat?.size,
        });
      } catch {
        errors.push(`Документ Рег.№ ${doc?.reg_num}, файл ${fileName} отсутствует.`);
      }
    }
    if (!isRkk) errors.push(`Документ Рег.№ ${doc?.reg_num}, отсутствует ркк.`);
  }
  if (errors[0]) {
    customError(errors.join(' '));
  }

  return data;
}

async function axiosHash(filePath): Promise<string> {
  const data = new FormData();
  data.append('obj_file', fs.createReadStream(filePath));

  const config = {
    method: "post",
    url: `${process.env.SYS_URL_SIGN}/hash/belt/`,
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };
  let result;
  try {
    result = await axios(config);
  } catch (e) {
    customError(e?.message);
  }

  return result?.data?.hash;
}

/**
 * Хэш от конкатенированной строки всех хэшей файлов
 */
export async function generationHash(org: string, docFilesPath: string[]): Promise<string> {
  const concatenatedHash = await generationConcatenatedHash(docFilesPath);
  const hash = await generationHashFromText(org, concatenatedHash);
  return hash;
}

/**
 * Конкатенированный хэш файлов
 */
export async function generationConcatenatedHash(docFilesPath: string[]): Promise<string> {
  let hash = '';

  if (docFilesPath.length === 0) {
      return hash;
  }

  const generationHash = async (index: number): Promise<void> => {
    if (index === docFilesPath.length) {
        return;
    }
    hash += await axiosHash(docFilesPath[index]);
    await generationHash(index + 1);
  };

  await generationHash(0);
  return hash.toUpperCase();
}

/**
 * Генерация хэша из текста
 */
 export async function generationHashFromText(org: string, content: string): Promise<string> {
  if (!content) return "";
  const fileName = `${uuidv4()}.txt`;
  const filePath = path.join(process.env.FILE_STAGE, org, fileName);
  await fsp.writeFile(filePath, content);
  const hash = await generationConcatenatedHash([filePath]);
  await fsp.unlink(filePath);
  return hash;
}

export async function getInnerInventory(org: string, docPackage: DocPackageEntity): Promise<string> {
  const nmncl = await docPackage?.Nomenclature;
  const file = await (await docPackage?.FileBlock)?.FileVersionMain;
  if (!file?.FileItemMain?.volume) customError(`Не найдена внутрення опись дела: ${nmncl?.index} ${nmncl?.name}`);

  const fileItemEntity = file.FileItemMain;
  const path = getPathVolume(org, fileItemEntity.date_create, fileItemEntity.volume);
  const stream = await readFileVolume({
    filePath: path,
    compress: fileItemEntity.compress,
  });
  const buffer = await streamToBuffer(stream);
  return buffer.toString();
}
