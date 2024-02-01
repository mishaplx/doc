import { SelectQueryBuilder } from "typeorm";

import { SortEnum } from "../../common/enum/enum";
import { OperationEntity } from "../../entity/#organization/role/operation.entity";
import { GetOperationArgs } from "./dto/get-operations.args";

export function setQueryBuilderOperation(
  args: GetOperationArgs,
  queryBuilder: SelectQueryBuilder<OperationEntity>,
): void {
  const { id, notIds, name, menu } = args;

  queryBuilder.innerJoinAndSelect("operation.MenuOptions", "MenuOptions");

  queryBuilder.where("operation.del = false");

  if (id) {
    queryBuilder.andWhere("operation.id = :id", { id });
  }

  if (notIds?.[0]) {
    queryBuilder.andWhere("operation.id NOT IN (:...notIds)", { notIds });
  }

  if (name) {
    queryBuilder.andWhere("operation.name ILIKE :name", { name: `%${name}%` });
  }

  if (menu) {
    queryBuilder.andWhere("MenuOptions.id = :menu", { menu });
  }

  queryBuilder.orderBy("MenuOptions.id", SortEnum.ASC);
  queryBuilder.addOrderBy("operation.name", SortEnum.ASC);
}
