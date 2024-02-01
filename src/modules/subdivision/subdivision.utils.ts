import { SelectQueryBuilder } from "typeorm";
import { OrderUnitEnum, SortEnum } from "../../common/enum/enum";
import { UnitEntity } from "../../entity/#organization/unit/unit.entity";
import { GetUnitArgs } from "./dto/get-unit";
import { OrderUnitInput } from "./dto/order-unit-request.dto";

export function setQueryBuilderUnit(
  args: GetUnitArgs,
  orderBy: OrderUnitInput,
  queryBuilder: SelectQueryBuilder<UnitEntity>,
): void {
  const { code, nm, short_name, db, de, parent_unit } = args;

  queryBuilder.leftJoinAndSelect("unit.ParentUnit", "ParentUnit");

  queryBuilder.where("unit.del = false");
  queryBuilder.andWhere("unit.temp = false");

  if (code) {
    queryBuilder.andWhere("unit.code ILIKE :code", {
      code: `%${code}%`,
    });
  }

  if (nm) {
    queryBuilder.andWhere("unit.nm ILIKE :nm", {
      nm: `%${nm}%`,
    });
  }

  if (short_name) {
    queryBuilder.andWhere("unit.short_name ILIKE :short_name", {
      short_name: `%${short_name}%`,
    });
  }

  if (db) {
    queryBuilder.andWhere("unit.db::date = :db", { db });
  }

  if (de) {
    queryBuilder.andWhere("unit.de::date = :de", { de });
  }

  if (parent_unit) {
    queryBuilder.andWhere("unit.parent_id = :parent_unit", { parent_unit });
  }

  getOrderAllUnit(queryBuilder, orderBy);
}

function getOrderAllUnit(
  queryBuilder: SelectQueryBuilder<UnitEntity>,
  orderBy: OrderUnitInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("unit.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderUnitEnum.code:
      queryBuilder.orderBy("unit.code", orderBy.sortEnum);
      break;
    case OrderUnitEnum.nm:
      queryBuilder.orderBy("unit.nm", orderBy.sortEnum);
      break;
    case OrderUnitEnum.short_name:
      queryBuilder.orderBy("unit.short_name", orderBy.sortEnum);
      break;
    case OrderUnitEnum.db:
      queryBuilder.orderBy("unit.db", orderBy.sortEnum);
      break;
    case OrderUnitEnum.de:
      queryBuilder.orderBy("unit.de", orderBy.sortEnum);
      break;
    case OrderUnitEnum.parent_unit:
      queryBuilder.orderBy("ParentUnit.nm", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("unit.id", SortEnum.DESC);
  }
}
