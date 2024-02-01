import { ILike } from "typeorm";
import { OrderTemplateContentEnum, SortEnum } from "../../common/enum/enum";
import { TempContentInterface } from "../../common/interfaces/tempContent.interface";
import { GetTemplateContentArgs } from "./dto/get-templateContent.args";
import { OrderTemplateContentInput } from "./dto/order-templateContent-request.dto";

export function getWhereFindAllTemp(args: GetTemplateContentArgs): TempContentInterface {
  const where: TempContentInterface = {};
  const { text } = args;

  if (text) {
    where.text = ILike(`%${text}%`);
  }

  return where;
}

export function getOrderFindAllTemp(orderBy: OrderTemplateContentInput): any {
  let order = null;

  switch (orderBy?.value) {
    case OrderTemplateContentEnum.text:
      order = { text: orderBy.sortEnum };
      break;
    default:
      order = { id: SortEnum.DESC };
  }

  return order;
}
