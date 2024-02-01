import { SelectQueryBuilder } from "typeorm";
import { OrderRolesEnum, SortEnum } from "../../common/enum/enum";
import { RolesEntity } from "../../entity/#organization/role/role.entity";
import { GetRoleArgs } from "./dto/get-roles.args";
import { OrderRolesInput } from "./dto/order-roles-request.dto";

export function setQueryBuilderRole(
  args: GetRoleArgs,
  orderBy: OrderRolesInput,
  queryBuilder: SelectQueryBuilder<RolesEntity>,
): void {
  const { id, name, nt, updated_at, editor, locked, operation } = args;

  queryBuilder.innerJoinAndSelect("role.Editor", "Editor");
  queryBuilder.innerJoinAndSelect("Editor.User", "E_User");
  queryBuilder.innerJoinAndSelect("E_User.Staff", "E_Staff");
  queryBuilder.innerJoinAndSelect("Editor.post", "E_post");
  queryBuilder.leftJoinAndSelect("role.RoleOperations", "RoleOperations");
  queryBuilder.leftJoinAndSelect("RoleOperations.Operation", "R_Operations");

  queryBuilder.where("role.del = :del", { del: false });
  queryBuilder.andWhere("role.temp = :temp", { temp: false });

  if (id) {
    queryBuilder.andWhere("role.id = :id", { id });
  }

  if (name) {
    queryBuilder.andWhere("role.name ILIKE :name", { name: `%${name}%` });
  }

  if (nt) {
    queryBuilder.andWhere("role.nt ILIKE :nt", { nt: `%${nt}%` });
  }

  if (updated_at) {
    queryBuilder.andWhere("role.updated_at::date = :updated_at", {
      updated_at,
    });
  }

  if (editor) {
    queryBuilder.andWhere(
      `(E_staff.ln || ' ' || E_staff.nm || ' ' || E_staff.mn || ' / ' || E_post.nm) ILIKE :editor`,
      {
        editor: `%${editor}%`,
      },
    );
  }

  if (locked) {
    queryBuilder.andWhere("role.locked = :locked", { locked });
  }

  if (operation) {
    queryBuilder.andWhere("R_Operations.id = :operation", { operation });
  }

  getOrderAllRoles(queryBuilder, orderBy);
}

function getOrderAllRoles(
  queryBuilder: SelectQueryBuilder<RolesEntity>,
  orderBy: OrderRolesInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("role.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderRolesEnum.name:
      queryBuilder.orderBy("role.name", orderBy.sortEnum);
      break;
    case OrderRolesEnum.nt:
      queryBuilder.orderBy("role.nt", orderBy.sortEnum);
      break;
    case OrderRolesEnum.update_at:
      queryBuilder.orderBy("role.updated_at", orderBy.sortEnum);
      break;
    case OrderRolesEnum.editor:
      queryBuilder.orderBy({
        "E_staff.ln": orderBy.sortEnum,
        "E_staff.nm": orderBy.sortEnum,
        "E_staff.mn": orderBy.sortEnum,
        "E_post.nm": orderBy.sortEnum,
      });
      break;
    case OrderRolesEnum.locked:
      queryBuilder.orderBy("role.locked", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("role.id", SortEnum.DESC);
  }
}
