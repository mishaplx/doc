import { registerEnumType } from "@nestjs/graphql";
import { SettingsTypeEnum } from "../../BACK_SYNC_FRONT/enum/enum.settings";

/** Настройки */
export const SETTING_CONST = {
  /** PDF конвертер: адрес */
  URL_PDF_CREATE: {
    id: 1,
    nm: 'URL_PDF_CREATE',
  },
  /** PDF валидатор: адрес */
  URL_PDF_VERIFY: {
    id: 2,
    nm: 'URL_PDF_VERIFY',
  },
  /** Сервер ЭЦП: адрес */
  URL_SIGN: {
    id: 3,
    nm: 'URL_SIGN',
  },
  /** СМДО: адрес */
  SMDO_URL: {
    id: 4,
    nm: 'SMDO_URL',
  },
  /** СМДО: имя пользователя */
  SMDO_USERNAME: {
    id: 5,
    nm: 'SMDO_USERNAME',
  },
  /** СМДО: пароль */
  SMDO_PASSWORD: {
    id: 6,
    nm: 'SMDO_PASSWORD',
  },
  /** СМДО: код текущей организации */
  SMDO_CODE: {
    id: 7,
    nm: 'SMDO_CODE',
  },
  /** СМДО: текстовое название текущей системы документооборота */
  SMDO_SYSTEM: {
    id: 8,
    nm: 'SMDO_SYSTEM',
  },
  /** СМДО: ID текущей системы документооборота */
  SMDO_SYSTEM_ID: {
    id: 9,
    nm: 'SMDO_SYSTEM_ID',
  },
  /** СМДО: текстовое описание текущей системы документооборота */
  SMDO_SYSTEM_DETAILS: {
    id: 10,
    nm: 'SMDO_SYSTEM_DETAILS',
  },

  // -----

  /** СМДО: период автоматической синхронизации справочников (в формате CRON) */
  SMDO_SYNCRHONIZE_SHEDULER: {
    id: 12,
    nm: 'SMDO_SYNCRHONIZE_SHEDULER',
  },
  /** СМДО: период автоматической синхронизации пакетов (в формате CRON) */
  SMDO_SYNCRHONIZE_PACKAGES_SCHEDULER: {
    id: 13,
    nm: 'SMDO_SYNCRHONIZE_PACKAGES_SCHEDULER',
  },
  /** Системные настройки: период автматического обновления, сек. */
  SETTINGS_UPDATE: {
    id: 14,
    nm: 'SETTINGS_UPDATE',
  },

  // -----

  /** Почтовый импорт: адреса электронной почты, через | */
  INCMAIL_EMAIL: {
    id: 17,
    nm: 'incmail.email',
  },
  /** Почтовый импорт: пароли электронной почты, через | */
  INCMAIL_PASS: {
    id: 18,
    nm: 'incmail.pass',
  },

  // -----

  /** Почтовый импорт: хосты электронной почты, через | */
  INCMAIL_HOST: {
    id: 29,
    nm: 'incmail.host',
  },
  /** Отправка электронной почты: SMTP-сервер */
  EMAIL_HOST: {
    id: 30,
    nm: 'nodemailer.host',
  },
  /** Отправка электронной почты: порт */
  EMAIL_PORT: {
    id: 31,
    nm: 'nodemailer.port',
  },
  /** Отправка электронной почты: логин */
  EMAIL_USER: {
    id: 32,
    nm: 'nodemailer.host.user',
  },
  /** Отправка электронной почты: пароль */
  EMAIL_PASS: {
    id: 33,
    nm: 'nodemailer.host.password',
  },
  /** Отправка электронной почты: адрес отправителя */
  EMAIL_FROM: {
    id: 34,
    nm: 'nodemailer.from',
  },
  /** Отправка электронной почты: проверять сертификат */
  EMAIL_AUTH: {
    id: 35,
    nm: 'nodemailer.rejectUnauthorized',
  },
  /** Отправка электронной почты: не использовать TLS */
  EMAIL_TLS_OFF: {
    id: 36,
    nm: 'nodemailer.ignoreTLS',
  },
  /** Сервер PDF валидатор: таймаут, сек. */
  TIMEOUT_PDF_VERIFY: {
    id: 37,
    nm: 'TIMEOUT_PDF_VERIFY',
  },
  /** Сервер PDF конвертер: таймаут, сек. */
  TIMEOUT_PDF_CREATE: {
    id: 38,
    nm: 'TIMEOUT_PDF_CREATE',
  },
  /** Сервер ЭЦП: таймаут, сек. */
  TIMEOUT_SIGN: {
    id: 39,
    nm: 'TIMEOUT_SIGN',
  },
  /** Время проверки этапа проекта (ЧЧ:MM) */
  PROJECT_TIME_DEFAULT: {
    id: 40,
    nm: 'time.project',
  },
  /** Протокол для приема сообщений электронной почты: pop3, imap */
  EMAIL_PROTOKOL: {
    id: 41,
    nm: 'email.protokol',
  },
  /** POP3: порт */
  EMAIL_POP3_PORT: {
    id: 42,
    nm: 'pop3.port',
  },
  /** POP3: хост */
  EMAIL_POP3_HOST: {
    id: 43,
    nm: 'pop3.host',
  },
  /** POP3: имя пользователя */
  EMAIL_POP3_USER: {
    id: 44,
    nm: 'pop3.user',
  },
  /** POP3: пароль почтового ящика */
  EMAIL_POP3_PASS: {
    id: 45,
    nm: 'pop3.pass',
  },
  /** POP3: игнорировать ошибки TLS */
  EMAIL_POP3_TLS_ERRIGNOGE: {
    id: 46,
    nm: 'pop3.tlserrs',
  },
  /** POP3: использовать TLS соединение */
  EMAIL_POP3_TLS_ENABLED: {
    id: 47,
    nm: 'pop3.enabletls',
  },
  /** CCSLite: актуальная версия для работы с ЭЦП */
  CCSLITE_VERSION: {
    id: 48,
    nm: 'CCSLITE_VERSION',
  },
  /** Место расположения подразделения */
  PROPS_PLACE: {
    id: 49,
    nm: 'PROPS_PLACE',
  },
  /** СМДО: задержка отправки пакета, мин. */
  SMDO_SEND_DELAY: {
    id: 50,
    nm: 'SMDO_SEND_DELAY',
  },
  /** СМДО: повторная отправка пакета, мин. */
  SMDO_SEND_REPEAT: {
    id: 51,
    nm: 'SMDO_SEND_REPEAT',
  },
  /** СМДО: включить */
  SMDO_ENABLED: {
    id: 52,
    nm: 'SMDO_ENABLED',
  },
  /** Аутентификация: время жизни токена доступа, мин. */
  JWT_EXPIRE_ACCESS: {
    id: 53,
    nm: 'JWT_EXPIRE_ACCESS',
  },
  /** Аутентификация: длительность сессии (для новой сессии требуется ввод логина и пароля), час. */
  JWT_EXPIRE_REFRESH: {
    id: 54,
    nm: 'JWT_EXPIRE_REFRESH',
  },
  /** Аутентификация: сессия только с IP, с которого она зарегистрирована */
  JWT_CONTROL_IP: {
    id: 55,
    nm: 'JWT_CONTROL_IP',
  },
  /** Аутентификация: ввод пароля - максимальное количество неверных попыток */
  LOGIN_WRONG_COUNT: {
    id: 56,
    nm: 'LOGIN_WRONG_COUNT',
  },
  /** Аутентификация: ввод пароля - время блокировки пользователя после максимального количества неверных попыток, мин. */
  LOGIN_WRONG_EXPIRE: {
    id: 57,
    nm: 'LOGIN_WRONG_EXPIRE',
  },
  /** Аутентификация: допустимое время бездействия пользователя, мин. */
  LOGIN_TIMEOUT: {
    id: 58,
    nm: 'LOGIN_TIMEOUT',
  },
  /** Файл: время хранения редактирования, мин. */
  FILE_EDIT_EXCLUSIVE: {
    id: 59,
    nm: 'FILE_EDIT_EXCLUSIVE',
  },
  /** Файл: время хранения версий, час. (0 - срок не задан) */
  FILE_VERSION_STAGE: {
    id: 60,
    nm: 'FILE_VERSION_STAGE',
  },
  /** Сообщения с сервера: дублировать на почту пользователя */
  MSG_EMAIL: {
    id: 61,
    nm: 'MSG_EMAIL',
  },
} as const;

export type TSettingConstKey = keyof typeof SETTING_CONST;
export type TSettingConstId = typeof SETTING_CONST[TSettingConstKey]['id'];
export type TSettingConstNm = typeof SETTING_CONST[TSettingConstKey]['nm'];


registerEnumType(SettingsTypeEnum, {
  name: "SettingsTypeEnum",
  description: "Типы переменных глобальных настроек",
  valuesMap: {
    boolean: {
      description: "булево значение",
    },
    string: {
      description: "строка",
    },
    number: {
      description: "число",
    },
  },
});
