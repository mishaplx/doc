/** Настройки */
export const AUDIT_OPERATION_TYPE = {
  AUTH: {
    id: 0,
    nm: 'Авторизация',
  },
  AUDIT: {
    id: 1,
    nm: 'Аудит',
  },
  PACK: {
    id: 2,
    nm: 'Дела',
  },
  DOC: {
    id: 3,
    nm: 'Документы',
  },
  PROJECT: {
    id: 4,
    nm: 'Проекты',
  },
  JOB: {
    id: 5,
    nm: 'Поручения',
  },
  REPORT: {
    id: 6,
    nm: 'Отчеты',
  },
  FIND: {
    id: 7,
    nm: 'Поиск',
  },
  EMAIL: {
    id: 8,
    nm: 'Почтовый импорт',
  },
  SETTING: {
    id: 9,
    nm: 'Системные настройки',
  },
  SMDO: {
    id: 10,
    nm: 'СМДО',
  },
  CATALOG: {
    id: 12,
    nm: 'Справочники',
  },
} as const;

export type TAuditOperationTypeKey = keyof typeof AUDIT_OPERATION_TYPE;
export type TAuditOperationTypeId = typeof AUDIT_OPERATION_TYPE[TAuditOperationTypeKey]['id'];
export type TAuditOperationTypeNm = typeof AUDIT_OPERATION_TYPE[TAuditOperationTypeKey]['nm'];
