import { ILike } from "typeorm";

import { OrderOrgEnum, SortEnum } from "../../common/enum/enum";
import { IWhereFindAllOrg } from "../../common/interfaces/org.interface";
import { GetOrgsArgs } from "./dto/get-orgs.args";
import { OrderOrgInput } from "./dto/order-org-request.dto";

export function getWhereFindAllOrg(args: GetOrgsArgs): IWhereFindAllOrg {
  const where: IWhereFindAllOrg = {};
  const { fnm, nm, region, adress, phone, fax, email, smdo_abonent } = args;

  if (nm) {
    where.nm = ILike(`%${nm}%`);
  }

  if (fnm) {
    where.fnm = ILike(`%${fnm}%`);
  }

  if (region) {
    where.region = region;
  }

  if (adress) {
    where.adress = ILike(`%${adress}%`);
  }

  if (phone) {
    where.phone = ILike(`%${phone}%`);
  }

  if (fax) {
    where.fax = ILike(`%${fax}%`);
  }

  if (email) {
    where.email = ILike(`%${email}%`);
  }

  if (smdo_abonent) {
    where.SmdoAbonent = { abbreviatedName: ILike(`%${smdo_abonent}%`) };
  }

  return where;
}
type TypeOrderOrg =
  | Record<string, SortEnum>
  | { SmdoAbonent: { abbreviatedName: SortEnum } }
  | { Region: { nm: SortEnum } };

export function getOrderFindAllOrg(orderBy: OrderOrgInput): TypeOrderOrg {
  let order: TypeOrderOrg;

  switch (orderBy?.value) {
    case OrderOrgEnum.fnm:
      order = { fnm: orderBy.sortEnum };
      break;
    case OrderOrgEnum.nm:
      order = { nm: orderBy.sortEnum };
      break;
    case OrderOrgEnum.region:
      order = { Region: { nm: orderBy.sortEnum } };
      break;
    case OrderOrgEnum.adress:
      order = { adress: orderBy.sortEnum };
      break;
    case OrderOrgEnum.phone:
      order = { phone: orderBy.sortEnum };
      break;
    case OrderOrgEnum.fax:
      order = { fax: orderBy.sortEnum };
      break;
    case OrderOrgEnum.email:
      order = { email: orderBy.sortEnum };
      break;
    case OrderOrgEnum.smdo_abonent:
      order = { SmdoAbonent: { abbreviatedName: orderBy.sortEnum } };
      break;
    default:
      order = { id: SortEnum.DESC };
  }

  return order;
}
