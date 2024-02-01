import { ILike } from "typeorm";
import { OrderAbonentsEnum, SortEnum } from "../../common/enum/enum";
import { IWhereFindAllAbonents } from "../../common/interfaces/abonents.interface";
import { GetAbonentsArgs } from "./dto/get-abonents.args";
import { OrderAbonentsInput } from "./dto/order-abonents-request.dto";

export function getWhereFindAllAbonents(
  serachValue: string,
  args: GetAbonentsArgs,
): IWhereFindAllAbonents {
  const where: IWhereFindAllAbonents = {};
  const { nm, short_nm, smdo_code, row_id, status_smdo } = args;

  if (serachValue) {
    where.brandName = ILike(`%${serachValue}%`);
  }

  if (nm) {
    where.fullName = ILike(`%${nm}%`);
  }

  if (short_nm) {
    where.abbreviatedName = ILike(`%${short_nm}%`);
  }

  if (smdo_code) {
    where.smdoCode = ILike(`%${smdo_code}%`);
  }

  if (row_id) {
    where.rowId = ILike(`%${row_id}%`);
  }

  if (status_smdo) {
    where.subscriberStatus = status_smdo;
  }

  return where;
}

export function getOrderFindAllAbonents(orderBy: OrderAbonentsInput): any {
  let order = null;

  switch (orderBy?.value) {
    case OrderAbonentsEnum.nm:
      order = { fullName: orderBy.sortEnum };
      break;
    case OrderAbonentsEnum.short_nm:
      order = { abbreviatedName: orderBy.sortEnum };
      break;
    case OrderAbonentsEnum.smdo_code:
      order = { smdoCode: orderBy.sortEnum };
      break;
    case OrderAbonentsEnum.row_id:
      order = { rowId: orderBy.sortEnum };
      break;
    case OrderAbonentsEnum.status_smdo:
      order = { subscriberStatus: orderBy.sortEnum };
      break;
    default:
      order = { id: SortEnum.DESC };
  }

  return order;
}
