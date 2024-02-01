import { PickType } from "@nestjs/graphql";
import { InventoryName } from "../../../../../common/enum/enum";
import { InventoryNameEntity } from "../../../../../entity/#organization/inventoryName/inventoryName.entity";

class InventoryNameSeed extends PickType(InventoryNameEntity, [
  "id",
  "del",
  "nm",
  "short_nm",
] as const) {}

export const inventoryNameArr: InventoryNameSeed[] = [
  {
    id: InventoryName.PH,
    del: false,
    nm: "Опись электронных дел постоянного хранения",
    short_nm: "ПХ",
  },
  {
    id: InventoryName.UD,
    del: false,
    nm: "Опись электронных дел постоянного хранения управленческой документации",
    short_nm: "УД",
  },
  {
    id: InventoryName.LS,
    del: false,
    nm: "Опись электронных дел постоянного хранения по личному составу",
    short_nm: "ЛС",
  },
  {
    id: InventoryName.PD,
    del: false,
    nm: "Опись электронных дел постоянного хранения проектной документации",
    short_nm: "ПД",
  },
  {
    id: InventoryName.KD,
    del: false,
    nm: "Опись электронных дел постоянного хранения конструкторской документации",
    short_nm: "КД",
  },
  {
    id: InventoryName.TD,
    del: false,
    nm: "Опись электронных дел постоянного хранения технологической документации",
    short_nm: "ТД",
  },
  {
    id: InventoryName.NIR,
    del: false,
    nm: "Опись электронных дел постоянного хранения научно-исследовательской документации",
    short_nm: "НИР",
  },
  {
    id: InventoryName.PATD,
    del: false,
    nm: "Опись электронных дел постоянного хранения патентной документации",
    short_nm: "ПатД",
  },
  {
    id: InventoryName.OKR,
    del: false,
    nm: "Опись электронных дел постоянного хранения опытно-конструкторских работ",
    short_nm: "ОКР",
  },
  {
    id: InventoryName.NIOK,
    del: false,
    nm: "Опись электронных дел постоянного хранения научно-исследовательских, опытно-конструкторских работ",
    short_nm: "НИОКР",
  },
  {
    id: InventoryName.TEMPORARY,
    del: false,
    nm: "Опись дел временного (свыше 10 лет) хранения",
    short_nm: "",
  },
  {
    id: InventoryName.END_OF_NEED,
    del: false,
    nm: "Опись дел временного (до 10 лет включительно) хранения",
    short_nm: "",
  },
  {
    id: InventoryName.BY_STAFF,
    del: false,
    nm: "Опись электронных дел по личному составу",
    short_nm: "",
  },
];
