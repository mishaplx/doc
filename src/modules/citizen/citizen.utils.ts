import { ILike } from "typeorm";
import { OrderCitizenEnum, SortEnum } from "../../common/enum/enum";
import { IWhereFindAllCitizen } from "../../common/interfaces/citizen.interface";
import { GetCitizenArgs } from "./dto/get-citizen.args";
import { OrderCitizenInput } from "./dto/order-citizen-request.dto";

export function getWhereFindAllCitizen(args: GetCitizenArgs): IWhereFindAllCitizen {
  const where: IWhereFindAllCitizen = {};
  const { ln, nm, mn, region, addr, email } = args;

  if (ln) {
    where.ln = ILike(`%${ln}%`);
  }

  if (nm) {
    where.nm = ILike(`%${nm}%`);
  }

  if (mn) {
    where.mn = ILike(`%${mn}%`);
  }

  if (region) {
    where.region_id = region;
  }

  if (addr) {
    where.addr = ILike(`%${addr}%`);
  }

  if (email) {
    where.email = ILike(`%${email}%`);
  }

  return where;
}

export function getOrderFindAllCitizen(orderBy: OrderCitizenInput): any {
  let order = null;

  switch (orderBy?.value) {
    case OrderCitizenEnum.ln:
      order = { ln: orderBy.sortEnum };
      break;
    case OrderCitizenEnum.nm:
      order = { nm: orderBy.sortEnum };
      break;
    case OrderCitizenEnum.mn:
      order = { mn: orderBy.sortEnum };
      break;
    case OrderCitizenEnum.region:
      order = { region: { nm: orderBy.sortEnum } };
      break;
    case OrderCitizenEnum.addr:
      order = { addr: orderBy.sortEnum };
      break;
    case OrderCitizenEnum.email:
      order = { email: orderBy.sortEnum };
      break;
    default:
      order = { id: SortEnum.DESC };
  }

  return order;
}
