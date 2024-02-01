import { ILike } from "typeorm";
import { IWhereFindAllTerm } from "../../common/interfaces/term.interface";
import { GetTermArgs } from "./dto/get-terms.args";

export function getWhereFindAllTerm(args: GetTermArgs): IWhereFindAllTerm {
  const where: IWhereFindAllTerm = {};
  const { nm } = args;

  where.del = false;
  where.temp = false;

  if (nm) {
    where.nm = ILike(`%${nm}%`);
  }

  return where;
}
