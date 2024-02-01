import { SelectQueryBuilder } from "typeorm";
import { OrderDocPackagesDeletedEnum, SortEnum } from "../../common/enum/enum";
import { DocPackageDeletedEntity } from "../../entity/#organization/docPackageDeleted/docPackageDeleted.entity";
import { GetDocPackagesDeletedArgs } from "./dto/get-doc-packages-deleted.args";
import { OrderDocPackagesDeletedInput } from "./dto/order-doc-packages-deleted-request.dto";

export function setQueryBuilderDocPackageDeleted(
  args: GetDocPackagesDeletedArgs,
  orderBy: OrderDocPackagesDeletedInput,
  queryBuilder: SelectQueryBuilder<DocPackageDeletedEntity>,
): void {
  const {
    ids,
    dtc,
    year,
    index,
    title,
    start_date,
    end_date,
    count_doc,
    count_file,
    storage_period,
    article_storage,
    comment,
    nt,
    act_id,
  } = args;

  if (ids?.[0]) {
    queryBuilder.andWhere("doc_package_deleted.id IN (:...ids)", { ids });
  }

  if (dtc) {
    queryBuilder.andWhere("doc_package_deleted.dtc::date = :dtc", { dtc });
  }

  if (year) {
    queryBuilder.andWhere("doc_package_deleted.year = :year", { year });
  }

  if (index) {
    queryBuilder.andWhere("doc_package_deleted.index ILIKE :index", {
      index: `%${index}%`,
    });
  }

  if (title) {
    queryBuilder.andWhere("doc_package_deleted.title ILIKE :title", {
      title: `%${title}%`,
    });
  }

  if (start_date) {
    queryBuilder.andWhere("doc_package_deleted.start_date = :start_date", {
      start_date,
    });
  }

  if (end_date) {
    queryBuilder.andWhere("doc_package_deleted.end_date = :end_date", { end_date });
  }

  if (Number.isInteger(count_doc)) {
    queryBuilder.andWhere("doc_package_deleted.count_doc = :count_doc", { count_doc });
  }

  if (Number.isInteger(count_file)) {
    queryBuilder.andWhere("doc_package_deleted.count_file = :count_file", {
      count_file,
    });
  }

  if (storage_period) {
    queryBuilder.andWhere("doc_package_deleted.storage_period ILIKE :storage_period", {
      storage_period: `%${storage_period}%`,
    });
  }

  if (article_storage) {
    queryBuilder.andWhere("doc_package_deleted.article_storage ILIKE :article_storage", {
      article_storage: `%${article_storage}%`,
    });
  }

  if (comment) {
    queryBuilder.andWhere("doc_package_deleted.comment ILIKE :comment", {
      comment: `%${comment}%`,
    });
  }

  if (nt) {
    queryBuilder.andWhere("doc_package_deleted.nt ILIKE :nt", {
      nt: `%${nt}%`,
    });
  }

  if (Number.isInteger(act_id)) {
    queryBuilder.andWhere("doc_package_deleted.act_id = :act_id", { act_id });
  }

  getOrderAllDocPackagesDeleted(queryBuilder, orderBy);
}

function getOrderAllDocPackagesDeleted(
  queryBuilder: SelectQueryBuilder<DocPackageDeletedEntity>,
  orderBy: OrderDocPackagesDeletedInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("doc_package_deleted.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderDocPackagesDeletedEnum.id:
      queryBuilder.orderBy("doc_package_deleted.id", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.act_id:
      queryBuilder.orderBy("doc_package_deleted.act_id", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.article_storage:
      queryBuilder.orderBy("doc_package_deleted.article_storage", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.comment:
      queryBuilder.orderBy("doc_package_deleted.comment", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.count_doc:
      queryBuilder.orderBy("doc_package_deleted.count_doc", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.count_file:
      queryBuilder.orderBy("doc_package_deleted.count_file", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.dtc:
      queryBuilder.orderBy("doc_package_deleted.dtc", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.end_date:
      queryBuilder.orderBy("doc_package_deleted.end_date", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.index:
      queryBuilder.orderBy("doc_package_deleted.index", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.nt:
      queryBuilder.orderBy("doc_package_deleted.nt", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.start_date:
      queryBuilder.orderBy("doc_package_deleted.start_date", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.storage_period:
      queryBuilder.orderBy("doc_package_deleted.storage_period", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.title:
      queryBuilder.orderBy("doc_package_deleted.title", orderBy.sortEnum);
      break;
    case OrderDocPackagesDeletedEnum.year:
      queryBuilder.orderBy("doc_package_deleted.year", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("doc_package_deleted.id", SortEnum.DESC);
  }
}
