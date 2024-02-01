import { ILike } from "typeorm";
import { OrderProjectsTemplateEnum, SortEnum } from "../../../common/enum/enum";
import { IWhereFindAllProjectsTemplate } from "../../../common/interfaces/projectsTemplate.interface";
import { GetProjectsTemplateArgs } from "./dto/get-projects-template.args";
import { OrderProjectTemplateInput } from "./dto/order-projects-template-request.dto";

export const changeArrName: (arr, arrAction) => string[] = (arr, arrAction) => {
  const arrChangeType = arr.doc_route.map((item) => Number(item));
  const resArr = [];
  for (let i = 0; i < arrChangeType.length; i++) {
    for (let j = 0; j < arrAction.length; j++) {
      if (arrChangeType[i] === arrAction[j].id) resArr.push(arrAction[j].name);
    }
  }

  return resArr;
};

export function getWhereFindAllProjectsTemplate(
  args: GetProjectsTemplateArgs,
): IWhereFindAllProjectsTemplate {
  const where: IWhereFindAllProjectsTemplate = {};
  const { name, type_doc, view_doc } = args;

  if (name) {
    where.name = ILike(`%${name}%`);
  }

  if (type_doc) {
    where.type_document = type_doc;
  }

  if (view_doc) {
    where.view_document = view_doc;
  }

  return where;
}

export function getOrderFindAllProjectsTemplate(orderBy: OrderProjectTemplateInput): any {
  let order = null;

  switch (orderBy?.value) {
    case OrderProjectsTemplateEnum.name:
      order = { name: orderBy.sortEnum };
      break;
    case OrderProjectsTemplateEnum.type_doc:
      order = { Typedoc: { nm: orderBy.sortEnum } };
      break;
    case OrderProjectsTemplateEnum.view_doc:
      order = { Viewdoc: { nm: orderBy.sortEnum } };
      break;
    default:
      order = { id: SortEnum.DESC };
  }

  return order;
}
