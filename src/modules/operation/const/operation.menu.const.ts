/** Операции: группы */
export const OPERATION_MENU = {
  /** Входящие документы */
  DOC_INCOME: {
    id: 1,
    nm: 'Входящие документы',
  },
  /** Исходящие документы */
  DOC_OUTCOME: {
    id: 2,
    nm: 'Исходящие документы',
  },
  /** Внутренние документы */
  DOC_INNER: {
    id: 3,
    nm: 'Внутренние документы',
  },
  /** Поручения */
  JOB: {
    id: 4,
    nm: 'Поручения',
  },
  /** Проекты */
  PROJECT: {
    id: 5,
    nm: 'Проекты',
  },
  /** Справочники */
  CATALOG: {
    id: 6,
    nm: 'Справочники',
  },
  /**Регистрация */
  REGISTER: {
    id: 7,
    nm: 'Регистрация',
  },
  /** Настройки системы */
  SETTING: {
    id: 8,
    nm: 'Настройки системы',
  },
  /** Аудит */
  AUDIT: {
    id: 9,
    nm: 'Аудит',
  },
  /** Почтовый импорт */
  EMAIL_IMPORT: {
    id: 10,
    nm: 'Почтовый импорт',
  },
  /** Дела */
  PACK: {
    id: 11,
    nm: 'Дела',
  },
  /** Каталог справочников */
  CATALOG_GROUP: {
    id: 12,
    nm: 'Каталог справочников',
  },
  /** Поиск */
  SEARCH: {
    id: 13,
    nm: 'Поиск',
  },
  /** Лог сообщений */
  LOG: {
    id: 14,
    nm: 'Лог сообщений',
  },
  /** Отчёты */
  REPORT: {
    id: 15,
    nm: 'Отчёты',
  },
} as const;

export type TOperationMenuKey = keyof typeof OPERATION_MENU;
export type TOperationMenuId = (typeof OPERATION_MENU)[TOperationMenuKey]['id'];
export type TOperationMenuNm = (typeof OPERATION_MENU)[TOperationMenuKey]['nm'];
