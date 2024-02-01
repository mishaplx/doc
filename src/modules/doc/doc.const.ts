import { registerEnumType } from "@nestjs/graphql";

/** Типы документов */
export enum DocumentTypes {
  /** Входящий */
  INCOME = 1,
  /** Исходящий */
  OUTCOME = 2,
  /** Внутренний */
  INNER = 3,
  /**Обращение */
  APPEAL = 4,
}

/** Статусы документов */
export const DocStatus = {
  /** Новый */
  NEWDOC: {
    id: 1,
    nm: "Новый",
  },
  /** На регистрации */
  INREGISTRATE: {
    id: 2,
    nm: "На регистрации",
  },
  /** Зарегистрирован */
  REGISTRATE: {
    id: 3,
    nm: "Зарегистрирован",
  },
  /** На рассмотрении */
  INVIEW: {
    id: 4,
    nm: "На рассмотрении",
  },
  /** На исполнении */
  INDO: {
    id: 5,
    nm: "На исполнении",
  },
  /** Исполнен */
  DONE: {
    id: 6,
    nm: "Исполнен",
  },
  /** В деле */
  INWORK: {
    id: 7,
    nm: "В деле",
  },
  /** не подлежит регистрации */
  NOTREGISTER: {
    id: 9,
    nm: "Не подлежит регистрации",
  },
};

/** Участники документа */
export enum PartiesDocs {
  /** Автор */
  AUTHOR = 1,
  /** Исполнитель по передаче / пересылке */
  RECEIVER = 2,
}

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


/**
 * ДОКУМЕНТ: ДОСТАВКА
 */
export enum DeliveryEnum {
  /** Почта */
  MAIL = 1,
  /** Электронная почта */
  EMAIL = 2,
  /** Атлас */
  ATLAS = 3,
  /** Факс */
  FAX = 4,
  /** Курьер */
  COURIER = 5,
  /** Интернет */
  INTERNET = 6,
  /** Устно */
  ORALLY = 7,
  /** СМДО */
  SMDO = 8,
  /** Сканер */
  SCANER = 9,
}

registerEnumType(DeliveryEnum, {
  name: "DeliveryEnum",
  description: "Документ: доставка",
  valuesMap: {
    MAIL: { description: "Почта" },
    EMAIL: { description: "Электронная почта" },
    ATLAS: { description: "Атлас" },
    FAX: { description: "Факс" },
    COURIER: { description: "Курьер" },
    INTERNET: { description: "Интернет" },
    ORALLY: { description: "Устно" },
    SMDO: { description: "СМДО" },
    SCANER: { description: "Сканер" },
  },
});


registerEnumType(PartiesDocs, {
  name: "PartiesDocs",
  description: "Участники документа.",
  valuesMap: {
    AUTHOR: {
      description: "Автор.",
    },
    RECEIVER: {
      description: "Исполнитель по передаче / пересылке.",
    },
  },
});
