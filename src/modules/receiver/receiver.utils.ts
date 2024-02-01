import { ILike } from "typeorm";

import { OrderReceiverEnum, SortEnum } from "../../common/enum/enum";
import { TypeOrderDefault } from "../../common/type/Orger.default.type";
import { GetReceiverArgs } from "./dto/get-receiver.args";
import { OrderReceiverRequestDto } from "./dto/order-receiver-request.dto";
export interface ReceiverUtils {
  receiver_name?: string;
}
export function getWhereFindAllTemp(args: GetReceiverArgs): ReceiverUtils {
  const where: ReceiverUtils = {};
  const { receiver_name } = args;

  if (receiver_name) {
    where[receiver_name] = ILike(`%${receiver_name}%`);
  }

  return where;
}

export function getOrderFindAllTemp(orderBy: OrderReceiverRequestDto): TypeOrderDefault {
  let order: TypeOrderDefault;

  switch (orderBy?.value) {
    case OrderReceiverEnum.receiver_name:
      order = { receiver_name: orderBy.sortEnum };
      break;
    default:
      order = { id: SortEnum.DESC };
  }

  return order;
}
