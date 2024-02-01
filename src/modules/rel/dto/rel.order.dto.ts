import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { SortEnum } from "../../../common/enum/enum";

/** Поля сортировки связок документов */
export enum OrderRelEnum {
  /** № */
  ID = 1,
  /** Дата создания */
  DATE_CREATE = 2,
  /** Тип связки */
  TYPE = 3,
  /** Наименование связки */
  NAME = 4,
}

@InputType()
export class RelOrder {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderRelEnum)
  value: OrderRelEnum;
}

registerEnumType(OrderRelEnum, {
  name: "OrderRelEnum",
  description: "Поля сортировки связок документов",
  valuesMap: {
    ID: {
      description: "№",
    },
    DATE_CREATE: {
      description: "Дата создания",
    },
    TYPE: {
      description: "Тип",
    },
    NAME: {
      description: "Наименование",
    },
  },
});
