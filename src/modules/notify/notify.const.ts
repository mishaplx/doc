/** Группы типов уведомлений */
export const NOTIFY_TYPE_GROUP = {
  PROJECT: {
    id: 1,
    nm: 'Проекты',
  },
  DOC: {
    id: 2,
    nm: 'Документы',
  },
  JOB: {
    id: 3,
    nm: 'Поручения',
  },
  SERVER: {
    id: 4,
    nm: 'Задачи сервера',
  },
  ANY: {
    id: 5,
    nm: 'Разное',
  },
} as const;

export type TNotifyTypeGroupKey = keyof typeof NOTIFY_TYPE_GROUP;
export type TNotifyTypeGroupId = typeof NOTIFY_TYPE_GROUP[TNotifyTypeGroupKey]['id'];
export type TNotifyTypeGroupNm = typeof NOTIFY_TYPE_GROUP[TNotifyTypeGroupKey]['nm'];


/** Типы уведомлений. Используется в т.ч. в сидах */
export enum NotifyTypeEnum {
  /** Проект: назначение участником */
  PROJECT_EXEC_ADD = 1,
  /** Проект: наступление очереди */
  PROJECT_QUEUE_ADVANCE = 20,
  /** Проект: возврат на доработку */
  PROJECT_RET_REWORK = 70,
  /** Проект: закрытие */
  PROJECT_CLOSE = 80,
  /** Проект: завершение */
  PROJECT_END = 90,

  /** Документ: передача / пересылка */
  DOC_GET = 100,
  // /** Документ: необходимость регистрации */
  // DOC_REG = 101,

  /** Поручение: статус - исполнитель */
  JOB_STATUS_EXEC = 200,
  /** Поручение: статус - ответственный исполнитель */
  JOB_STATUS_RESP = 201,
  /** Поручение: статус - контролер */
  JOB_STATUS_CONTROL = 205,
  /** Поручение: статус - предконтролер */
  JOB_STATUS_PRECONTROL = 210,

  /** Поручение: Запрос: утверждение */
  JOB_REQUEST_APPROV = 220,
  /** Поручение: Запрос: продление срока */
  JOB_REQUEST_TERM = 225,

  /** Поручение: Решение: утвердить */
  JOB_RESOLV_APPROV = 240,
  /** Поручение: Решение: вернуть на исполнение */
  JOB_RESOLV_REEXEC = 241,
  /** Поручение: Решение: вернуть на доработку */
  JOB_RESOLV_REWORK = 245,
  /** Поручение: Решение: срок продлить / не продлить */
  JOB_RESOLV_TERM = 250,
  /** Поручение: Решение: снять с контроля */
  JOB_RESOLV_CONTROL_OFF = 255,
  /** Поручение: Решение: удалить */
  JOB_RESOLV_DELETE = 260,

  /** Поручение: Инфо: контроль срока */
  // JOB_INFO_TERM = 270,
  /** Поручение: Инфо: исполнено */
  JOB_INFO_FULFILLED = 280,

  /** Сервер: отложенная задача ошибка */
  SERVER_ERROR = 500,
  /** Сервер: отложенная задача предупреждение */
  SERVER_WARNING = 501,
  /** Сервер: отложенная задача инфо */
  SERVER_INFO = 502,
  /** Сервер: отложенная задача успешно */
  SERVER_SUCCESS = 503,

  /** Разное: назначение изменено */
  ANY_EMP_CHANGE = 610,
  // /** Разное: почта отправка  */
  // ANY_MAIL_SEND = 620,
  // /** Разное: файл конвертация */
  // ANY_FILE_CONVERT_TRUE = 630,

  /** СИСТЕМНОЕ СООБЩЕНИЕ: ОТПРАВЛЯТЬ ВСЕГДА */
  SYS = 999,
}
