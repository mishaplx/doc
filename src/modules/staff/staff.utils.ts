import { ILike, IsNull, Not } from "typeorm";

import { OrderStaffEnum, SortEnum } from "../../common/enum/enum";
import { IWhereFindAllStaff } from "../../common/interfaces/staff.interface";
import { GetStaffArgs } from "./dto/get-staff.args";
import { OrderStaffInput } from "./dto/order-staff-request.dto";

export function getWhereFindAllStaff(args: GetStaffArgs): IWhereFindAllStaff {
  const where: IWhereFindAllStaff = {};
  const { nm, ln, mn, eml, phone, dob, isHasUser, personnal_number } = args;

  where.del = false;
  where.temp = false;

  if (nm) {
    where.nm = ILike(`%${nm}%`);
  }

  if (ln) {
    where.ln = ILike(`%${ln}%`);
  }

  if (mn) {
    where.mn = ILike(`%${mn}%`);
  }

  if (personnal_number) {
    where.personnal_number = ILike(`%${personnal_number}%`);
  }

  if (eml) {
    where.eml = ILike(`%${eml}%`);
  }

  if (phone) {
    where.phone = ILike(`%${phone}%`);
  }

  if (dob) {
    where.dob = dob;
  }

  if (isHasUser) {
    where.user_id = IsNull();
  }

  return where;
}

export function getOrderFindAllStaff(orderBy: OrderStaffInput): any {
  let order = null;

  switch (orderBy?.value) {
    case OrderStaffEnum.nm:
      order = { nm: orderBy.sortEnum };
      break;
    case OrderStaffEnum.ln:
      order = { ln: orderBy.sortEnum };
      break;
    case OrderStaffEnum.mn:
      order = { mn: orderBy.sortEnum };
      break;
    case OrderStaffEnum.eml:
      order = { eml: orderBy.sortEnum };
      break;
    case OrderStaffEnum.phone:
      order = { phone: orderBy.sortEnum };
      break;
    case OrderStaffEnum.dob:
      order = { dob: orderBy.sortEnum };
      break;
    case OrderStaffEnum.personnal_number:
      order = { personnal_number: orderBy.sortEnum };
      break;
    default:
      order = { id: SortEnum.DESC };
  }

  return order;
}
