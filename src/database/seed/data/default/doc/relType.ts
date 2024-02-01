import { PickType } from "@nestjs/graphql";
import { RelTypesEntity } from "../../../../../entity/#organization/rel/relTypes.entity";

class RelTypesSeed extends PickType(RelTypesEntity, [
  "id",
  "name_direct",
  "name_reverse",
  "del",
  "can_be_edited",
] as const) {}

export const RelTypeArr: RelTypesSeed[] = [
  {
    id: 1,
    name_direct: "В ответ на",
    name_reverse: "Исходящий",
    del: false,
    can_be_edited: false,
  },
  {
    id: 2,
    name_direct: "Первичный",
    name_reverse: "Повторный",
    del: false,
    can_be_edited: false,
  },
  {
    id: 3,
    name_direct: "Во исполнение",
    name_reverse: "Исполнен",
    del: false,
    can_be_edited: false,
  },
  {
    id: 4,
    name_direct: "В дополнение",
    name_reverse: "Дополнен",
    del: false,
    can_be_edited: false,
  },
];
