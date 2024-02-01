import { ILike } from "typeorm";

import { OrderRefTypesEnum, SortEnum } from "../../../common/enum/enum";
import { IWhereRelTypes } from "../../../common/interfaces/rel.interface";
import { OrderRefTypesInput } from "./dto/order-reftypes-request.dto";
import { RelTypesGet } from "./dto/relTypes.find.dto";

export function getWhereAllRelTypes(args: RelTypesGet): IWhereRelTypes {
  const where: IWhereRelTypes = {};
  where.del = false;
  const { id, name_direct, name_reverse, del } = args;

  if (id) {
    where.id = id;
  }

  if (name_direct) {
    where.name_direct = ILike(`%${name_direct}%`);
  }

  if (name_reverse) {
    where.name_reverse = ILike(`%${name_reverse}%`);
  }

  return where;
}

export function getOrderAllRelTypes(orderBy: OrderRefTypesInput): any {
  let order = null;

  switch (orderBy?.value) {
    case OrderRefTypesEnum.name_direct:
      order = { name_direct: orderBy.sortEnum };
      break;
    case OrderRefTypesEnum.name_reverse:
      order = { name_reverse: orderBy.sortEnum };
      break;
    default:
      order = { id: SortEnum.DESC };
  }

  return order;
}
