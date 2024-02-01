import { JobStatus } from "../../../../BACK_SYNC_FRONT/enum/enum.job";
import { ActionsJob } from "../../../../BACK_SYNC_FRONT/actions/actions.job";

/********************************************
 * ДОПУСТИМЫЕ СТАТУСЫ ДЛЯ КАЖДОЙ ОПЕРАЦИИ
 ********************************************/
export const ACCESS_STATUS_JOB = {
  /** Создать подчиненное поручение */
  [ActionsJob.JOB_CREATE_CHILD]: [
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.FULFILLED,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
    JobStatus.CLOSED,
  ],

  /** Создать шаблон поручения */
  [ActionsJob.JOB_CREATE_TEMPLATE]: [JobStatus.ON_EXECUTION, JobStatus.RETURNED_FOR_EXECUTION],

  /** Обновить поручение */
  [ActionsJob.JOB_UPDATE]: [JobStatus.IN_PROGRESS, JobStatus.ON_APPROVAL, JobStatus.ON_REWORK],

  /** Удалить поручение */
  [ActionsJob.JOB_DELETE]: [JobStatus.IN_PROGRESS, JobStatus.ON_REWORK],

  /** Отправить на утверждение */
  [ActionsJob.JOB_SEND_APPROV]: [JobStatus.IN_PROGRESS, JobStatus.ON_REWORK],

  /** Отправить на доработку */
  [ActionsJob.JOB_SEND_REWORK]: [JobStatus.ON_APPROVAL],

  /** Утвердить */
  [ActionsJob.JOB_SET_APPROV]: [JobStatus.ON_APPROVAL],

  /** Утвердить с ЭЦП */
  [ActionsJob.JOB_SET_APPROV_SIGN]: [JobStatus.ON_APPROVAL],

  /** Проверить ЭЦП */
  [ActionsJob.JOB_VERIFY_SIGN]: [
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.FULFILLED,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
    JobStatus.CLOSED,
  ],

  /** Отправить на исполнение */
  [ActionsJob.JOB_SEND_EXEC]: [JobStatus.APPROVED],

  /** Запросить продление срока */
  [ActionsJob.JOB_ASK_PROLONG]: [JobStatus.ON_EXECUTION, JobStatus.RETURNED_FOR_EXECUTION],

  /** Сохранить шаблон */
  [ActionsJob.JOB_SAVE_TEMPLATE]: [],

  /** Исполнить */
  [ActionsJob.JOB_SET_EXEC]: [JobStatus.ON_EXECUTION, JobStatus.RETURNED_FOR_EXECUTION],

  /** Установить периодичность */
  [ActionsJob.JOB_SET_LOOP]: [JobStatus.ON_APPROVAL],

  /** Установить параметры периодичности */
  [ActionsJob.JOB_SET_LOOP_PARAM]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
  ],

  /**
   * ОТЧЕТЫ ПО ПОРУЧЕНИЯМ
   */

  /** Отчет скачать: РКК */
  [ActionsJob.JOB_REPORT_DOWNLOAD_RKK]: [
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.FULFILLED,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
    JobStatus.CLOSED,
  ],

  /**
   * ИСТОРИЯ ПОКАЗАТЬ
   */

  /** История: отчеты */
  [ActionsJob.JOB_HISTORY_REPORT]: [
    JobStatus.ON_EXECUTION,
    JobStatus.FULFILLED,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
    JobStatus.CLOSED,
  ],

  /** История: запросы на продление срока */
  [ActionsJob.JOB_HISTORY_PROLONG]: [
    JobStatus.ON_EXECUTION,
    JobStatus.FULFILLED,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
    JobStatus.CLOSED,
  ],

  /** История: сводящие */
  [ActionsJob.JOB_HISTORY_RESPONSIBLE]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.FULFILLED,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
    JobStatus.CLOSED,
  ],

  /**
   * ИСПОЛНИТЕЛИ ПОРУЧЕНИЯ
   */

  /** Исполнитель: добавить */
  [ActionsJob.JOB_EXECUTOR_ADD]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Исполнитель: изменить */
  [ActionsJob.JOB_EXECUTOR_UPDATE]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Исполнитель: удалить */
  [ActionsJob.JOB_EXECUTOR_DEL]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /**
   * КОНТРОЛЬ
   */

  /** Контроль: добавить */
  [ActionsJob.JOB_CONTROL_ADD]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Контроль: редактировать */
  [ActionsJob.JOB_CONTROL_EDIT]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Контроль: удалить */
  [ActionsJob.JOB_CONTROL_DEL]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Контроль: вернуть */
  [ActionsJob.JOB_CONTROL_REWORK]: [JobStatus.ON_PRECONTROL, JobStatus.ON_CONTROL],

  /** Контроль: срок продлить */
  [ActionsJob.JOB_CONTROL_TERM_APPROV]: [
    JobStatus.ON_EXECUTION,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Контроль: срок отказать */
  [ActionsJob.JOB_CONTROL_TERM_REFUSE]: [JobStatus.ON_EXECUTION, JobStatus.RETURNED_FOR_EXECUTION],

  /** Контроль: предконтроль */
  [ActionsJob.JOB_CONTROL_BEFORE]: [JobStatus.ON_PRECONTROL],

  /** Контроль: снять */
  [ActionsJob.JOB_CONTROL_CANCEL]: [
    JobStatus.ON_EXECUTION,
    JobStatus.ON_PRECONTROL,
    JobStatus.ON_CONTROL,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /**
   * ФАЙЛЫ ПО ПОРУЧЕНИЮ
   */

  /** Файл: добавить */
  [ActionsJob.JOB_FILE_ADD]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Файл: удалить */
  [ActionsJob.JOB_FILE_DEL]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Файл: скачать */
  // TODO handlers
  [ActionsJob.JOB_FILE_DOWNLOAD]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],

  /** Файл: подписать */
  [ActionsJob.JOB_FILE_SIGN_SET]: [
    JobStatus.IN_PROGRESS,
    JobStatus.ON_APPROVAL,
    JobStatus.ON_REWORK,
    JobStatus.APPROVED,
    JobStatus.ON_EXECUTION,
    JobStatus.RETURNED_FOR_EXECUTION,
  ],
};

export type ACCESS_STATUS_JOB = typeof ACCESS_STATUS_JOB;
