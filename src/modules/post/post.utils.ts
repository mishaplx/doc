import { ILike } from "typeorm";
import { IWhereFindAllPost } from "../../common/interfaces/post.interface";
import { GetPostArgs } from "./dto/get-post.args";

export function getWhereFindAllPost(args: GetPostArgs): IWhereFindAllPost {
  const where: IWhereFindAllPost = {};
  const { nm } = args;

  where.del = false;
  where.temp = false;

  if (nm) {
    where.nm = ILike(`%${nm}%`);
  }

  return where;
}
