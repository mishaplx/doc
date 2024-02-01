/**
 * !!!!!!!!! ВАЖНО !!!!!!!!!!!
 * ЕДИНЫЙ ФАЛ ДЛЯ БЭКА И ФРОНТА
 * ПРИ ИЗМЕНЕНИИ ОБЯЗАТЕЛЬНО МЕНЯТЬ И ЕГО В ДРУГОМ МЕСТЕ
 */

/** ПОДПИСКИ: ТИПЫ */
export enum PsEnum {
  /** базовая */
  base = 'subscriptionBase',

  /** базовая */
  admin = 'subscriptionAdmin',

  /** завершена конвертация в PDF */
  // pdfConverted: 'subscriptionPdfConverted'
}

/** ПОДПИСКИ: БАЗОВАЯ: ТИПЫ */
export enum PsBaseEnum {
  /** Сообщение: успешно */
  success = 'success',
  /** Сообщение: ошибка */
  error = 'error',
  /** Сообщение: предупреждение */
  warning = 'warning',
  /** Сообщение: инфо */
  info = 'info',
  /** Системное событие */
  sys = 'sys',
}

/** ПОДПИСКИ: БАЗОВАЯ: КОДЫ (для системных оповещений) */
export enum PsBaseCodeEnum {
  /** Сессия завершена - перейти на страницу регистрации */
  session_terminated = 'session_terminated',
  /** Обновлен список уведомлений */
  notify_refresh = 'notify_refresh',
}
