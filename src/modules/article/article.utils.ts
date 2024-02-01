import { ILike } from "typeorm";
import { OrderArticleEnum, SortEnum } from "../../common/enum/enum";
import { IWhereFindAllArticle } from "../../common/interfaces/article.interface";
import { GetArticleArgs } from "./dto/get-articles.args";
import { OrderArticleInput } from "./dto/order-article-request.dto";

export function getWhereFindAllArticle(args: GetArticleArgs): IWhereFindAllArticle {
  const where: IWhereFindAllArticle = {};
  const { nm, cd, term_nm, is_actual } = args;

  where.del = false;
  where.temp = false;

  if (nm) {
    where.nm = ILike(`%${nm}%`);
  }

  if (cd) {
    where.cd = ILike(`%${cd}%`);
  }

  if (term_nm) {
    where.term = { nm: ILike(`%${term_nm}%`) };
  }

  if (typeof is_actual === "boolean") {
    where.is_actual = is_actual;
  }

  return where;
}

export function getOrderFindAllArticle(orderBy: OrderArticleInput): any {
  let order = null;

  switch (orderBy?.value) {
    case OrderArticleEnum.nm:
      order = { nm: orderBy.sortEnum };
      break;
    case OrderArticleEnum.cd:
      order = { cd: orderBy.sortEnum };
      break;
    case OrderArticleEnum.term_nm:
      order = { term: { nm: orderBy.sortEnum } };
      break;
    case OrderArticleEnum.is_actual:
      order = { is_actual: orderBy.sortEnum };
      break;
    default:
      order = { is_actual: SortEnum.DESC, id: SortEnum.DESC };
  }

  return order;
}
