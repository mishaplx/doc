import fs from "fs";
import { create } from "xmlbuilder2";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { EntityManager, Repository, SelectQueryBuilder } from "typeorm";
import { OrderActEnum, SortEnum } from "../../common/enum/enum";
import { ActEntity } from "../../entity/#organization/act/act.entity";
import { createFileMainUtil } from "../file/fileCreate/fileCreate.utils";
import { bufferToStream } from "../file/utils/file.common.utils";
import { GetActArgs } from "./dto/get-act.args";
import { OrderActInput } from "./dto/order-act-request.dto";
import dayjs from "dayjs";

export function setQueryBuilderAct(
  args: GetActArgs,
  orderBy: OrderActInput,
  queryBuilder: SelectQueryBuilder<ActEntity>,
): void {
  const { id, number, dtc, basis, count_doc_package, count_doc, count_file, status_id } = args;

  queryBuilder.innerJoinAndSelect("act.Status", "Status", "Status.del = false");

  queryBuilder.where("act.del = false");
  queryBuilder.andWhere("act.temp = false");

  if (id) {
    queryBuilder.andWhere("act.id = :id", { id });
  }

  if (number) {
    queryBuilder.andWhere("act.number ILIKE :number", { number: `%${number}%` });
  }

  if (dtc) {
    queryBuilder.andWhere("act.dtc::date = :dtc", { dtc });
  }

  if (basis) {
    queryBuilder.andWhere("act.basis ILIKE :basis", { basis: `%${basis}%` });
  }

  if (Number.isInteger(count_doc_package)) {
    queryBuilder.andWhere("act.count_doc_package = :count_doc_package", { count_doc_package });
  }

  if (Number.isInteger(count_doc)) {
    queryBuilder.andWhere("act.count_doc = :count_doc", { count_doc });
  }

  if (Number.isInteger(count_file)) {
    queryBuilder.andWhere("act.id = :count_file", { count_file });
  }

  if (status_id) {
    queryBuilder.andWhere("act.status_id = :status_id", { status_id });
  }

  getOrderAllInventory(queryBuilder, orderBy);
}

function getOrderAllInventory(
  queryBuilder: SelectQueryBuilder<ActEntity>,
  orderBy: OrderActInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("act.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderActEnum.id:
      queryBuilder.orderBy("act.id", orderBy.sortEnum);
      break;
    case OrderActEnum.number:
      queryBuilder.orderBy("act.number", orderBy.sortEnum);
      break;
    case OrderActEnum.dtc:
      queryBuilder.orderBy("act.dtc", orderBy.sortEnum);
      break;
    case OrderActEnum.basis:
      queryBuilder.orderBy("act.basis", orderBy.sortEnum);
      break;
    case OrderActEnum.count_doc_package:
      queryBuilder.orderBy("act.count_doc_package", orderBy.sortEnum);
      break;
    case OrderActEnum.count_doc:
      queryBuilder.orderBy("act.count_doc", orderBy.sortEnum);
      break;
    case OrderActEnum.count_file:
      queryBuilder.orderBy("act.count_file", orderBy.sortEnum);
      break;
    case OrderActEnum.status_id:
      queryBuilder.orderBy("Status.nm", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("act.id", SortEnum.DESC);
  }
}

export function queryBuilderActById(
  id: number,
  actRepository: Repository<ActEntity>,
): Promise<ActEntity> {
  return (
    actRepository
      .createQueryBuilder("act")
      .select()
      .innerJoinAndSelect("act.Status", "Status", "Status.del = false")
      .leftJoinAndSelect("act.Author", "Author")
      .leftJoinAndSelect("Author.User", "Au_User")
      .leftJoinAndSelect("Au_User.Staff", "Au_Staff")
      .leftJoinAndSelect("Author.post", "Au_post")
      .leftJoinAndSelect("act.DeleteDocPackageUser", "DeleteDocPackageUser")
      .leftJoinAndSelect("DeleteDocPackageUser.User", "De_User")
      .leftJoinAndSelect("De_User.Staff", "De_Staff")
      .leftJoinAndSelect("DeleteDocPackageUser.post", "De_post")
      .leftJoinAndSelect("act.DocPackages", "DocPackages", "DocPackages.del = false")
      .leftJoinAndSelect("DocPackages.Status", "DocPackStatus", "DocPackStatus.del = false")
      .leftJoinAndSelect("DocPackages.Nomenclature", "Nomenclature", "Nomenclature.del = false")
      .leftJoinAndSelect("Nomenclature.MainParent", "MainParent", "MainParent.del = false")
      .leftJoinAndSelect(
        "Nomenclature.Article",
        "Article",
        "Article.del = false AND Article.temp = false",
      )
      .leftJoinAndSelect("Article.term", "term", "term.del = false AND term.temp = false")
      .leftJoinAndSelect("DocPackages.Docs", "Docs", "Docs.del = false AND Docs.temp = false")
      //.leftJoinAndSelect('Docs.FileBlock', 'FileBlock')
      .leftJoinAndSelect("act.DocPackagesDeleted", "DocPackagesDeleted")
      .where("act.id = :id", { id })
      .andWhere("act.del = false")
      .andWhere("act.temp = false")
      .getOne()
  );
}

export function filesDeleter(pathFiles: string[]): Promise<unknown[]> {
  return Promise.all(
    pathFiles.map(
      (path) =>
        new Promise(() => {
          try {
            fs.unlink(path, (err) => {
              if (err) console.log(err.message);
            });
          } catch (e) {}
        }),
    ),
  );
}

export async function formDocumentAct(
  id: number,
  manager: EntityManager,
  token: IToken,
): Promise<void> {
  const act = await manager.findOne(ActEntity, {
    relations: { DocPackages: true },
    where: { id: id },
  });
  const dtc = act.dtc ? dayjs(act.dtc).format("YYYY-MM-DD") : "";
  const emkDate = act.dtc ? dayjs(act.date_emk).format("YYYY-MM-DD") : "";
  const startDate = act.start_date ? dayjs(act.start_date).format("YYYY-MM-DD") : "";
  const endDate = act.end_date ? dayjs(act.end_date).format("YYYY-MM-DD") : "";

  // Формируем xml
  const root = create();
  const document = root.ele("Act");
  document.ele("Number").txt(act.number || "");
  document.ele("Dtc").txt(dtc);
  document.ele("Basis").txt(act.basis || "");
  document.ele("NumberEmk").txt(act.number_emk || "");
  document.ele("EmkDate").txt(emkDate);
  document.ele("StartDate").txt(startDate);
  document.ele("EndDate").txt(endDate);
  document.ele("CountDocPackage").txt(String(act.count_doc_package));
  document.ele("CountDoc").txt(String(act.count_doc));
  document.ele("CountFile").txt(String(act.count_file));

  const istItems = document.ele("ListItems");
  for await (const docPackage of await act.DocPackages) {
    const archiveKeeping = istItems.ele("ArchiveKeeping");
    archiveKeeping.ele("ArchiveKeepingId").txt(String(docPackage.id));
  }
  const xml = root.end({ prettyPrint: true });
  const buffer = Buffer.from(xml);

  // Сохраняем xml-документ "Акт"
  await createFileMainUtil({
    manager,
    files: [
      {
        stream: bufferToStream(buffer),
        originalname: "акт.xml",
      },
    ],
    param: {
      idAct: act.id,
    },
    token,
    file_block_one: true,
    file_version_one: true,
  });
}
