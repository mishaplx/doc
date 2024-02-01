import { PickType } from "@nestjs/graphql";
import { DocPackageStatus } from "../../../../../common/enum/enum";
import { DocPackageStatusEntity } from "../../../../../entity/#organization/docPackageStatus/docPackageStatus.entity";

class DocPackageStatusSeed extends PickType(DocPackageStatusEntity, ["id", "del", "nm"] as const) {}

export const docPackageStatusArr: DocPackageStatusSeed[] = [
  {
    id: DocPackageStatus.NEW,
    del: false,
    nm: "Новое",
  },
  {
    id: DocPackageStatus.INNER_INVENTORY_FORMED,
    del: false,
    nm: "Сформирована внутренняя опись",
  },
  {
    id: DocPackageStatus.INNER_INVENTORY_SIGN,
    del: false,
    nm: "Подписана внутрення опись",
  },
  {
    id: DocPackageStatus.INCLUDED_IN_INVENTORY,
    del: false,
    nm: "В описи",
  },
  {
    id: DocPackageStatus.INCLUDED_IN_ACT,
    del: false,
    nm: "В акте",
  },
];
