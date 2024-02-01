import { SmdoDocTypesEntity } from "src/entity/#organization/smdo/smdo_doc_types.entity";
import { SelectQueryBuilder } from "typeorm";
import { OrderTdocEnum, SortEnum } from "../../common/enum/enum";
import { TdocEntity } from "../../entity/#organization/doc/tdoc.entity";
import { GetTypeDocArgs } from "./dto/get-typeDoc.args";
import { OrderTdocInput } from "./dto/order-tdoc-request.dto";

export function setQueryBuilderTdoc(
  args: GetTypeDocArgs,
  orderBy: OrderTdocInput,
  queryBuilder: SelectQueryBuilder<TdocEntity>,
): void {
  const { nm, code, smdoDocTypes } = args;

  queryBuilder.leftJoinAndSelect(SmdoDocTypesEntity, "SmdoDocTypes", "SmdoDocTypes.name = tdoc.smdoDocTypes");
  queryBuilder.where("tdoc.del = false");
  queryBuilder.andWhere("tdoc.temp = false");

  if (nm) {
    queryBuilder.andWhere("tdoc.nm ILIKE :nm", { nm: `%${nm}%` });
  }

  if (code) {
    queryBuilder.andWhere("tdoc.code ILIKE :code", { code: `%${code}%` });
  }

  if (smdoDocTypes) {
    queryBuilder.andWhere("SmdoDocTypes.id = :smdoDocTypes", { smdoDocTypes });
  }

  getOrdeTdoc(queryBuilder, orderBy);
}

function getOrdeTdoc(
  queryBuilder: SelectQueryBuilder<TdocEntity>,
  orderBy: OrderTdocInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("tdoc.nm", SortEnum.ASC);
    return;
  }

  switch (orderBy.value) {
    case OrderTdocEnum.nm:
      queryBuilder.orderBy("tdoc.nm", orderBy.sortEnum);
      break;
    case OrderTdocEnum.code:
      queryBuilder.orderBy("tdoc.code", orderBy.sortEnum);
      break;
    case OrderTdocEnum.smdoDocTypes:
      queryBuilder.orderBy("SmdoDocTypes.name", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("tdoc.nm", SortEnum.ASC);
  }
}
