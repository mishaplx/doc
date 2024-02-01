import { PickType } from "@nestjs/graphql";
import { MenuOptionsEntity } from "../../../../../entity/#organization/role/menuOptions.entity";
import { OPERATION_MENU } from "../../../../../modules/operation/const/operation.menu.const";

class MenuOptionsSeed extends PickType(MenuOptionsEntity, ["id", "nm", "del"] as const) {}

export const menuOptionsArr: MenuOptionsSeed[] = [
  { id: OPERATION_MENU.DOC_INCOME.id, nm: OPERATION_MENU.DOC_INCOME.nm, del: false },
  { id: OPERATION_MENU.DOC_OUTCOME.id, nm: OPERATION_MENU.DOC_OUTCOME.nm, del: false },
  { id: OPERATION_MENU.DOC_INNER.id, nm: OPERATION_MENU.DOC_INNER.nm, del: false },
  { id: OPERATION_MENU.JOB.id, nm: OPERATION_MENU.JOB.nm, del: false },
  { id: OPERATION_MENU.PROJECT.id, nm: OPERATION_MENU.PROJECT.nm, del: false },
  { id: OPERATION_MENU.CATALOG.id, nm: OPERATION_MENU.CATALOG.nm, del: false },
  { id: OPERATION_MENU.REGISTER.id, nm: OPERATION_MENU.REGISTER.nm, del: true },
  { id: OPERATION_MENU.SETTING.id, nm: OPERATION_MENU.SETTING.nm, del: false },
  { id: OPERATION_MENU.AUDIT.id, nm: OPERATION_MENU.AUDIT.nm, del: false },
  { id: OPERATION_MENU.EMAIL_IMPORT.id, nm: OPERATION_MENU.EMAIL_IMPORT.nm, del: false },
  { id: OPERATION_MENU.PACK.id, nm: OPERATION_MENU.PACK.nm, del: false },
  { id: OPERATION_MENU.CATALOG_GROUP.id, nm: OPERATION_MENU.CATALOG_GROUP.nm, del: true },
  { id: OPERATION_MENU.SEARCH.id, nm: OPERATION_MENU.SEARCH.nm, del: false },
  { id: OPERATION_MENU.LOG.id, nm: OPERATION_MENU.LOG.nm, del: false },
  { id: OPERATION_MENU.REPORT.id, nm: OPERATION_MENU.REPORT.nm, del: false },
];
