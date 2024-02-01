import { PickType } from "@nestjs/graphql";
import { RolesEntity } from "../../../../../entity/#organization/role/role.entity";
import { menuOptionsArr } from "./menuOption";

class RolesSeed extends PickType(RolesEntity, [
  "id",
  "name",
  "del",
  "temp",
  "editor_id",
  "nt",
  "roles_menu_ops",
] as const) {}

export const roleArr: RolesSeed[] = [
  {
    id: 1,
    name: "Админ",
    del: false,
    temp: false,
    // updated_at: new Date(),
    editor_id: 1,
    nt: "роль администратор",
    roles_menu_ops: menuOptionsArr.filter((el) => el.del === false).map((el) => el.id),
  },
];
