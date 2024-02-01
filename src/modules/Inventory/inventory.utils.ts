import dayjs from "dayjs";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { customError } from "src/common/type/errorHelper.type";
import { parseXml } from "src/common/utils/utils.xml";
import { DocPackageEntity } from "src/entity/#organization/docPackage/docPackage.entity";
import { LanguageEntity } from "src/entity/#organization/language/language.entity";
import { NomenclaturesEntity } from "src/entity/#organization/nomenclatures/nomenclatures.entity";
import { EntityManager, In, Repository, SelectQueryBuilder } from "typeorm";
import { create } from "xmlbuilder2";
import { InventoryName, OrderInventoryEnum, SortEnum, StoreAttribute } from "../../common/enum/enum";
import { InventoryEntity } from "../../entity/#organization/inventory/inventory.entity";
import { generationHashFromText, getInnerInventory } from "../docPackage/docPackage.utils";
import { createFileMainUtil } from "../file/fileCreate/fileCreate.utils";
import { bufferToStream } from "../file/utils/file.common.utils";
import { GetInventoryArgs } from "./dto/get-inventory.args";
import { OrderInventoryInput } from "./dto/order-inventory-request.dto";

export function setQueryBuilderInventory(
  args: GetInventoryArgs,
  orderBy: OrderInventoryInput,
  queryBuilder: SelectQueryBuilder<InventoryEntity>,
): void {
  const {
    id,
    number,
    inventory_name_id,
    inventory_year,
    description,
    count_doc_package,
    status_id,
  } = args;

  queryBuilder.innerJoinAndSelect("inventory.Status", "Status", "Status.del = false");
  queryBuilder.innerJoinAndSelect("inventory.Name", "Name", "Name.del = false");

  queryBuilder.where("inventory.del = false");
  queryBuilder.andWhere("inventory.temp = false");

  if (id) {
    queryBuilder.andWhere("inventory.id = :id", { id });
  }

  if (number) {
    queryBuilder.andWhere("inventory.number ILIKE :number", { number: `%${number}%` });
  }

  if (inventory_name_id) {
    queryBuilder.andWhere("inventory.inventory_name_id = :inventory_name_id", {
      inventory_name_id,
    });
  }

  if (inventory_year) {
    queryBuilder.andWhere("inventory.year ILIKE :year", { year: `%${inventory_year}%` });
  }

  if (description) {
    queryBuilder.andWhere("inventory.description ILIKE :description", {
      description: `%${description}%`,
    });
  }

  if (Number.isInteger(count_doc_package)) {
    queryBuilder.andWhere("inventory.count_doc_package = :count_doc_package", {
      count_doc_package,
    });
  }

  if (status_id) {
    queryBuilder.andWhere("inventory.status_id = :status_id", { status_id });
  }

  getOrderAllInventory(queryBuilder, orderBy);
}

function getOrderAllInventory(
  queryBuilder: SelectQueryBuilder<InventoryEntity>,
  orderBy: OrderInventoryInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("inventory.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderInventoryEnum.id:
      queryBuilder.orderBy("inventory.id", orderBy.sortEnum);
      break;
    case OrderInventoryEnum.number:
      queryBuilder.orderBy("inventory.number", orderBy.sortEnum);
      break;
    case OrderInventoryEnum.inventory_name_id:
      queryBuilder.orderBy("Name.nm", orderBy.sortEnum);
      break;
    case OrderInventoryEnum.inventory_year:
      queryBuilder.orderBy("inventory.year", orderBy.sortEnum);
      break;
    case OrderInventoryEnum.description:
      queryBuilder.orderBy("inventory.description", orderBy.sortEnum);
      break;
    case OrderInventoryEnum.count_doc_package:
      queryBuilder.orderBy("inventory.count_doc_package", orderBy.sortEnum);
      break;
    case OrderInventoryEnum.status_id:
      queryBuilder.orderBy("Status.nm", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("inventory.id", SortEnum.DESC);
  }
}

export function queryBuilderInventoryById(
  id: number,
  inventoryRepository: Repository<InventoryEntity>,
): Promise<InventoryEntity> {
  const queryBuilder = inventoryRepository
    .createQueryBuilder("inventory")
    .innerJoinAndSelect("inventory.Status", "Status", "Status.del = false")
    .innerJoinAndSelect("inventory.Name", "Name", "Name.del = false")
    .innerJoinAndSelect("inventory.Author", "Author")
    .leftJoinAndSelect("Author.User", "User")
    .leftJoinAndSelect("User.Staff", "Staff")
    .leftJoinAndSelect("Author.post", "post")
    .leftJoinAndSelect("inventory.DocPackages", "DocPackages", "DocPackages.del = false")
    .leftJoinAndSelect("DocPackages.Status", "DocPackStatus", "DocPackStatus.del = false")
    .leftJoinAndSelect("DocPackages.Nomenclature", "Nomenclature", "Nomenclature.del = false")
    .leftJoinAndSelect("Nomenclature.MainParent", "MainParent", "MainParent.del = false")
    .leftJoinAndSelect(
      "Nomenclature.Article",
      "Article",
      "Article.del = false AND Article.temp = false",
    )
    .leftJoinAndSelect("Article.term", "term", "term.del = false AND term.temp = false")
    .leftJoinAndSelect(
      "DocPackages.Inventory",
      "Inventory",
      "Inventory.del = false AND Inventory.temp = false",
    )
    .leftJoinAndSelect("Inventory.Name", "InvName", "InvName.del = false")
    .where("inventory.del = false")
    .andWhere("inventory.temp = false")
    .andWhere("inventory.id = :id", { id });

  return queryBuilder.getOne();
}

export async function formDocumentInventory(
  id: number,
  manager: EntityManager,
  token: IToken,
): Promise<void> {
  const inv = await manager.findOne(InventoryEntity, {
    relations: {
      DocPackages: {
        FileBlock: { FileVersionMain: true },
        Docs: true,
        Nomenclature: { Article: { term: true } },
      },
    },
    where: { id: id },
  })

  // Признак хранения дел, включенных в приемо-сдаточную опись
  let storeAttribute;
  if ([
    InventoryName.PH,
    InventoryName.UD,
    InventoryName.LS,
    InventoryName.PD,
    InventoryName.KD,
    InventoryName.TD,
    InventoryName.NIR,
    InventoryName.PATD,
    InventoryName.OKR,
    InventoryName.NIOK,
  ].includes(inv.inventory_name_id)) {
    storeAttribute = StoreAttribute.PERMANENT
  } else if (inv.inventory_name_id === InventoryName.TEMPORARY) {
    storeAttribute = StoreAttribute.TEMPORARY
  } else if (inv.inventory_name_id === InventoryName.END_OF_NEED) {
    storeAttribute = StoreAttribute.END_OF_NEED
  } else if (inv.inventory_name_id === InventoryName.BY_STAFF) {
    storeAttribute = StoreAttribute.BY_STAFF
  }

  // TODO Номер фонда
  const fundNumber = "1";

  // Формируем xml
  const root = create();
  const inventory = root.ele("Inventory");
  inventory.ele("StoreAttribute").txt(storeAttribute);
  // Заголовок приемо-сдаточной описи
  inventory.ele("Title").txt(inv.nt);
  // Описание описи
  inventory.ele("InDescription").txt(inv.description);
  // Описание описи
  inventory.ele("Index").txt(inv.number);
  inventory.ele("FundNumber").txt(fundNumber);
  // Количество дел
  inventory.ele("NumberKeeping").txt(String(inv.count_doc_package));
  // Группирующий элемент для дел
  const istItems = inventory.ele("ListItems");

  let indexInInventory = 1;
  for await (const docPackage of await inv.DocPackages) {
    // Группирует информацию о деле
    const archiveKeeping = istItems.ele("ArchiveKeeping");
    // Создаём XML-документ, описывающий дело
    const xmlDocPackage = await formArchiveKeeping(
      token.url,
      manager,
      docPackage,
      indexInInventory,
      storeAttribute,
      fundNumber,
    );
    const xmlBase64 = Buffer.from(xmlDocPackage).toString('base64');
    const hash = await generationHashFromText(token.url, xmlDocPackage);
    // XML-документ, описывающий дело, в формате base64
    archiveKeeping.ele("Document").txt(xmlBase64);
    // Содержит контрольную характеристику, хэш рассчитанный по алгоритму Belt от XML-документа для дела
    archiveKeeping.ele("Hash").txt(hash);

    indexInInventory += 1;
  }
  const xml = root.end({ prettyPrint: true });
  const buffer = Buffer.from(xml);

  // Сохраняем xml-документ для приемо-сдаточной описи
  await createFileMainUtil({
    manager,
    files: [
      {
        stream: bufferToStream(buffer),
        originalname: "опись.xml",
      },
    ],
    param: {
      idInventory: inv.id,
    },
    token,
    file_block_one: true,
    file_version_one: true,
  });
}

async function formArchiveKeeping(
  org: string,
  manager: EntityManager,
  docPackage: DocPackageEntity,
  indexInInventory: number,
  storeAttribute: string,
  fundNumber: string,
): Promise<string> {
  const nmncl = await docPackage?.Nomenclature;
  const beginAkDocsTs = dayjs(docPackage.start_date).format("YYYY-MM-DD");
  const endAkDocsTs = dayjs(docPackage.end_date).format("YYYY-MM-DD");

  // Объем документов дела
  let volumeED;
  try {
    // Объем документов дела считаем из внутренней описи
    const xmlInnerInventory = await getInnerInventory(org, docPackage);
    const xmlObj = await parseXml(xmlInnerInventory);
    const { InnerInventory } = xmlObj;
    let listElectronicDocuments = InnerInventory
      ?.ListElectronicDocuments?.[0]
      ?.ElectronicDocument;
    volumeED = listElectronicDocuments.reduce((total, doc) => total + Number(doc.VolumeFileDocument[0]), 0);
  } catch (err) {
    customError(`Дело ${nmncl?.index} ${nmncl?.name}. ${err?.message}`);
  }

  // Получаем языки док-тов
  const languagesId = [];
  (await docPackage.Docs).forEach((doc) => {
    languagesId.push(...doc.languages.map((l) => l.id));
  });

  const languagesArr = await manager.find(LanguageEntity, {
    select: { char_code_ru: true },
    where: { id: In(languagesId) },
  });
  const languagesCodeRu = languagesArr.map((l) => l.char_code_ru);

  // Получаем срок хранения
  let storageTime = '';
  const article = await nmncl.Article;
  // Если StoreAttribute имеет значение PERMANENT, то элемент StorageTime необязателен для заполнения
  if (storeAttribute !== StoreAttribute.PERMANENT) {
    const termNm = (await article.term).nm;
    const numberOfYears = getNumberOfYears(termNm);
    if (numberOfYears) {
      storageTime = String(numberOfYears);
    }
  }

  // TODO
  const epk = false;

  // Получаем индекс подразделения (код) по номенклатуре
  // Если родитель - первый уровень, то код берем из индекса текущей номенклатуры,
  // если родитель не первый уровень, то код берем из индекса родителя номенклатуры
  let subdivisionCode = nmncl.index;
  if (nmncl.parent_id !== nmncl.main_parent_id) {
    const parentNmncl = await manager.findOne(NomenclaturesEntity, {
      select: { index: true },
      where: { id: nmncl.parent_id },
    });
    subdivisionCode = parentNmncl.index;
  }

  const root = create();
  // Группирующий элемент для метаданных дела
  const archiveKeeping = root.ele("ArchiveKeeping");
  // Порядковый номер дела в приемо-сдаточной описи.
  archiveKeeping.ele("IndexInInventory").txt(String(indexInInventory));
  // Содержит номер (индекс) дела
  archiveKeeping.ele("Index").txt(nmncl?.index);
  // Содержит номер (индекс) дела
  archiveKeeping.ele("Title").txt(nmncl?.name);
  // Крайние даты документов (Минимальная дата утверждения документов дела)
  archiveKeeping.ele("BeginAkDocsTs").txt(beginAkDocsTs);
  // Крайние даты документов (Максимальная дата утверждения документов дела)
  archiveKeeping.ele("EndAkDocsTs").txt(endAkDocsTs);
  // Количество документов дела
  archiveKeeping.ele("AmountED").txt(String(docPackage.count_doc));
  archiveKeeping.ele("VolumeED").txt(String(volumeED));
  // Список языков документа дела
  const languages = archiveKeeping.ele("Languages");
  languagesCodeRu.forEach((code) => {
    // Трехбуквенный кирилличный код из справочника языков
    languages.ele("Language").txt(code);
  });
  // Признак хранения дел
  archiveKeeping.ele("StoreAttribute").txt(storeAttribute);
  // Срок хранения, лет
  archiveKeeping.ele("StorageTime").txt(storageTime);
  // Внутренний идентификатор дела вo ВСЭД
  archiveKeeping.ele("IndexSED").txt(String(docPackage.id));
  // Номер фонда
  archiveKeeping.ele("FundNumber").txt(fundNumber);
  // Отметка экспертно-проверочной комиссии
  archiveKeeping.ele("EPK").txt(String(epk));
  // Комментарий по хранению
  archiveKeeping.ele("StorageComment").txt(nmncl.storage_comment || "");
  // Статья хранения
  archiveKeeping.ele("StorageArticle").txt(article.nm || "");
  // TODO Дата открытия дела во ВСЭД
  archiveKeeping.ele("OpenTs").txt(beginAkDocsTs);
  // TODO Дата закрытия дела во ВСЭД
  archiveKeeping.ele("ClosedTs").txt(endAkDocsTs);
  // Количество файлов дела
  archiveKeeping.ele("AmountFile").txt(String(docPackage.count_file));
  // Индекс подразделения (код) по номенклатуре
  archiveKeeping.ele("SubdivisionCode").txt(subdivisionCode);
  // Количество РКК
  // В одном док-те, одна ркк
  archiveKeeping.ele("RkkCount").txt(String(docPackage.count_doc));
  // Краткая характеристика дела
  // У нас она отсутствует
  archiveKeeping.ele("Description").txt("");
  // Примечание
  archiveKeeping.ele("Note").txt(nmncl.nt || "");

  const xml = root.end({ prettyPrint: true });
  return xml;
}

function getNumberOfYears(name: string) {
  if (name.includes("месяц")) {
      return 1;
  }
  const re = new RegExp("\\D+");
  const number = name.replace(re, '');
  if (number.length === 0) {
      return null;
  }
  return +number.valueOf();
}
