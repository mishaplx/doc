import { PickType } from "@nestjs/graphql";

import { DeliveryEntity } from "../../../../../entity/#organization/delivery/delivery.entity";
import { DeliveryEnum } from "../../../../../modules/doc/doc.const";

class DeliverySeed extends PickType(DeliveryEntity, [
  "id",
  "nm",
  "del",
  "temp",
  "can_be_edited",
] as const) {}

export const deliveryArr: DeliverySeed[] = [
  {
    id: DeliveryEnum.MAIL,
    nm: "почта",
    del: false,
    temp: false,
    can_be_edited: false,
  },
  {
    id: DeliveryEnum.EMAIL,
    nm: "электронная почта",
    del: false,
    temp: false,
    can_be_edited: false,
  },
  {
    id: DeliveryEnum.ATLAS,
    nm: "атлас",
    del: false,
    temp: false,
    can_be_edited: false,
  },
  {
    id: DeliveryEnum.FAX,
    nm: "факс",
    del: false,
    temp: false,
    can_be_edited: false,
  },
  {
    id: DeliveryEnum.COURIER,
    nm: "курьер",
    del: false,
    temp: false,
    can_be_edited: false,
  },
  {
    id: DeliveryEnum.INTERNET,
    nm: "интернет",
    del: false,
    temp: false,
    can_be_edited: false,
  },
  {
    id: DeliveryEnum.ORALLY,
    nm: "устно",
    del: false,
    temp: false,
    can_be_edited: false,
  },
  {
    id: DeliveryEnum.SMDO,
    nm: "СМДО",
    del: false,
    temp: false,
    can_be_edited: false,
  },
  {
    id: DeliveryEnum.SCANER,
    nm: "сканер",
    del: false,
    temp: false,
    can_be_edited: false,
  },
];
