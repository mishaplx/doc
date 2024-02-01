import { SelectQueryBuilder } from "typeorm";

import { OrderCdocEnum, SortEnum } from "../../common/enum/enum";
import { CdocEntity } from "../../entity/#organization/doc/cdoc.entity";
import { GetCdocArgs } from "./dto/get-cdoc.args";
import { OrderCdocInput } from "./dto/order-cdoc-request.dto";

export function setQueryBuilderCdoc(
  args: GetCdocArgs,
  orderBy: OrderCdocInput,
  queryBuilder: SelectQueryBuilder<CdocEntity>,
): void {
  const { id, code, nm } = args;

  if (id) {
    queryBuilder.andWhere("cdoc.id = :id", { id });
  }

  if (code) {
    queryBuilder.andWhere("cdoc.code ILIKE :code", { code: `%${code}%` });
  }

  if (nm) {
    queryBuilder.andWhere("cdoc.nm ILIKE :nm", { nm: `%${nm}%` });
  }

  getOrdeCdoc(queryBuilder, orderBy);
}

function getOrdeCdoc(
  queryBuilder: SelectQueryBuilder<CdocEntity>,
  orderBy: OrderCdocInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("cdoc.code", SortEnum.ASC);
    return;
  }

  switch (orderBy.value) {
    case OrderCdocEnum.id:
      queryBuilder.orderBy("cdoc.id", orderBy.sortEnum);
      break;
    case OrderCdocEnum.code:
      queryBuilder.orderBy("cdoc.code", orderBy.sortEnum);
      break;
    case OrderCdocEnum.nm:
      queryBuilder.orderBy("cdoc.nm", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("cdoc.code", SortEnum.ASC);
  }
}
