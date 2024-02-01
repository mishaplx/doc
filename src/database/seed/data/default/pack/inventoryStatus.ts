import { PickType } from "@nestjs/graphql";
import { InventoryStatus } from "../../../../../common/enum/enum";
import { InventoryStatusEntity } from "../../../../../entity/#organization/inventoryStatus/inventoryStatus.entity";

class InventoryStatusSeed extends PickType(InventoryStatusEntity, ["id", "del", "nm"] as const) {}

export const inventoryStatusArr: InventoryStatusSeed[] = [
  {
    id: InventoryStatus.NEW,
    del: false,
    nm: "Новая",
  },
  {
    id: InventoryStatus.IN_PROGRESS,
    del: false,
    nm: "В работе",
  },
  {
    id: InventoryStatus.SIGNED,
    del: false,
    nm: "Подписана",
  },
  {
    id: InventoryStatus.SENT,
    del: false,
    nm: "Отправлена",
  },
  {
    id: InventoryStatus.ERROR,
    del: false,
    nm: "Ошибка",
  },
  {
    id: InventoryStatus.ACCEPTED,
    del: false,
    nm: "Принята",
  },
];
