import { SelectQueryBuilder } from "typeorm";
import { SortEnum } from "../../common/enum/enum";
import { MenuOptionsEntity } from "../../entity/#organization/role/menuOptions.entity";
import { GetMenuOptionsArgs } from "./dto/get-menu-options.args";

export function setQueryBuilderMenuOptions(
  args: GetMenuOptionsArgs,
  queryBuilder: SelectQueryBuilder<MenuOptionsEntity>,
): void {
  const { id, nm } = args;

  if (id) {
    queryBuilder.andWhere("menu_options.id = :id", { id });
  }

  if (nm) {
    queryBuilder.andWhere("menu_options.nm ILIKE :nm", { nm: `%${nm}%` });
  }
  queryBuilder.where("del = false");
  queryBuilder.orderBy("menu_options.nm", SortEnum.ASC);
}
