import { PickType } from "@nestjs/graphql";
import { KdocEntity } from "../../../../../entity/#organization/doc/kdoc.entity";

class KdocSeed extends PickType(KdocEntity, ["id", "del", "nm", "can_be_edited"] as const) {}

export const KDOC_ID = {
  /** входящий */
  INCOME: 1,
  /** исходящий */
  OUTCOME: 2,
  /** внутренний */
  INNER: 3,
  /** обращения */
  APPEAL: 4,
};

export const kdocArr: KdocSeed[] = [
  {
    id: KDOC_ID.INCOME,
    del: false,
    nm: "Входящий",
    can_be_edited: false,
  },
  {
    id: KDOC_ID.OUTCOME,
    del: false,
    nm: "Исходящий",
    can_be_edited: false,
  },
  {
    id: KDOC_ID.INNER,
    del: false,
    nm: "Внутренний",
    can_be_edited: false,
  },
  {
    id: KDOC_ID.APPEAL,
    del: false,
    nm: "Обращения",
    can_be_edited: false,
  },
];
