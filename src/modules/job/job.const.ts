import { registerEnumType } from "@nestjs/graphql";

export const JOB = {
  /** максимальное количество периодичных поручений */
  LOOP_MAX: 50,
};

/** Периоды поручения */
export enum JobPeriods {
  /** Ежедневно */
  DAILY = 1,
  /** Еженедельно */
  WEEKLY = 2,
  /** Ежемесячно */
  MONTHLY = 3,
  /** Ежеквартально */
  QUARTERLY = 4,
  /** Раз в полгода */
  HALF_YEAR = 5,
  /** Ежегодно */
  YEARLY = 6,
}

/** Вкладки поручения */
export enum TabsJobs {
  /** Вкладка «В работе» */
  IN_PROGRESS = 0,
  /** Вкладка «Завершенные» */
  CLOSED = 1,
  /** Вкладка «Все» */
  ALL = 2,
}

registerEnumType(TabsJobs, {
  name: "TabsJobs",
  description: "Вкладки поручения.",
  valuesMap: {
    IN_PROGRESS: {
      description: "Вкладка «В работе».",
    },
    CLOSED: {
      description: "Вкладка «Завершенные».",
    },
    ALL: {
      description: "Вкладка «Все».",
    },
  },
});

/** Участники поручения */
export enum PartiesJobs {
  /** Автор */
  AUTHOR = 1,
  /** Исполнитель */
  EXECUTOR = 2,
  /** Ответственный (Создатель) */
  CREATED = 3,
  /** Контролёр */
  CONTROLLER = 4,
  /** Предконтролёр */
  PREV_CONTROLLER = 5,
}

registerEnumType(PartiesJobs, {
  name: "PartiesJobs",
  description: "Участники поручения.",
  valuesMap: {
    AUTHOR: {
      description: "Автор.",
    },
    EXECUTOR: {
      description: "Исполнитель.",
    },
    CREATED: {
      description: "Ответственный (Создатель).",
    },
    CONTROLLER: {
      description: "Контролёр.",
    },
    PREV_CONTROLLER: {
      description: "Предконтролёр.",
    },
  },
});

/** Поля сортировки поручений */
export enum OrderJobsEnum {
  /** № */
  ids = 1,
  /** Дата создания */
  dtc = 2,
  /** Содержание */
  body = 3,
  /** Исполнитель */
  executor = 4,
  /** Исполнить до */
  executionDate = 5,
  /** Автор */
  author = 6,
  /** Статус */
  status = 7,
  /** Фактическое исполнение */
  factDate = 8,
  /** Контроль */
  jobControl = 9,
  /** Документ */
  nameDocInJob = 10,
  /** Номер поручения */
  num = 11,
  /** Тип поручения */
  typeJob = 12,
}

registerEnumType(OrderJobsEnum, {
  name: "OrderJobsEnum",
  description: "Поля сортировки поручений.",
  valuesMap: {
    ids: {
      description: "№.",
    },
    dtc: {
      description: "Дата создания.",
    },
    body: {
      description: "Содержание.",
    },
    executor: {
      description: "Исполнитель.",
    },
    executionDate: {
      description: "Исполнить до.",
    },
    author: {
      description: "Автор.",
    },
    status: {
      description: "Статус.",
    },
    factDate: {
      description: "Фактическое исполнение.",
    },
    jobControl: {
      description: "Контроль.",
    },
    nameDocInJob: {
      description: "Документ.",
    },
    num: {
      description: "Номер поручения.",
    },
    typeJob: {
      description: "Тип поручения.",
    },
  },
});
