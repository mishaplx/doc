import { ILike, In } from "typeorm";
import { GetDirectoriesArgs } from "../common/argsType/get-directories.args";
import { IWhereFindAll } from "../common/interfaces/directories.interface";

export function getWhereFindAll(args: GetDirectoriesArgs): IWhereFindAll {
  const where: IWhereFindAll = {};
  const { ids, nm } = args;

  if (ids?.[0]) {
    where.id = In(ids);
  }

  if (nm) {
    where.nm = ILike(`%${nm}%`);
  }

  return where;
}
