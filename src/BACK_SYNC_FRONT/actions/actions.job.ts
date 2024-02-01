/**
 * !!!!!!!!! ВАЖНО !!!!!!!!!!!
 * ЕДИНЫЙ ФАЛ ДЛЯ БЭКА И ФРОНТА
 * ПРИ ИЗМЕНЕНИИ ОБЯЗАТЕЛЬНО МЕНЯТЬ И ЕГО В ДРУГОМ МЕСТЕ
 */

/********************************************
 * ВОЗМОЖНЫЕ ОПЕРАЦИИ
 ********************************************/
export const ActionsJob = {
  /** Создать подчиненное поручение */
  JOB_CREATE_CHILD: 'jobCreateChild',
  /** Создать шаблон поручения */
  JOB_CREATE_TEMPLATE: 'jobCreateTemplate',
  /** Обновить поручение */
  JOB_UPDATE: 'jobUpdate',
  /** Удалить поручение */
  JOB_DELETE: 'jobDelete',

  /** Отправить на утверждение */
  JOB_SEND_APPROV: 'jobSendApprov',
  /** Отправить на доработку */
  JOB_SEND_REWORK: 'jobSendRework',
  /** Утвердить */
  JOB_SET_APPROV: 'jobSetApprov',
  /** Утвердить с ЭЦП */
  JOB_SET_APPROV_SIGN: 'jobSetApprovSign',
  /** Подписать */
  JOB_VERIFY_SIGN: 'jobVerifySign',
  /** Отправить на исполнение */
  JOB_SEND_EXEC: 'jobSendExec',
  /** Запросить продление срока */
  JOB_ASK_PROLONG: 'jobAskProlong',
  /** Сохранить шаблон */
  JOB_SAVE_TEMPLATE: 'jobSaveTemplate',
  /** Исполнить */
  JOB_SET_EXEC: 'jobSetExec',
  /** Установить периодичность */
  JOB_SET_LOOP: 'jobSetLoop',
  /** Установить параметры периодичности */
  JOB_SET_LOOP_PARAM: 'jobSetLoopParam',

  /** Отчет скачать: РКК */
  JOB_REPORT_DOWNLOAD_RKK: 'jobReportDownloadRkk',

  /** История: отчеты */
  JOB_HISTORY_REPORT: 'jobHistoryReport',
  /** История: запросы на продление срока */
  JOB_HISTORY_PROLONG: 'jobHistoryProlong',
  /** История: сводящие */
  JOB_HISTORY_RESPONSIBLE: 'jobHistoryResponsible',

  /** Добавить исполнителя */
  JOB_EXECUTOR_ADD: 'jobExecutorAdd',
  /** Изменить исполнителя */
  JOB_EXECUTOR_UPDATE: 'jobExecutorUpdate',
  /** удалить исполнителя */
  JOB_EXECUTOR_DEL: 'jobExecutorDel',

  /** Контроль: добавить */
  JOB_CONTROL_ADD: 'jobControlAdd',
  /** Контроль: редактировать */
  JOB_CONTROL_EDIT: 'jobControlEdit',
  /** Контроль: удалить */
  JOB_CONTROL_DEL: 'jobControlDel',
  /** Контроль: вернуть */
  JOB_CONTROL_REWORK: 'jobControlRework',
  /** Контроль: срок продлить */
  JOB_CONTROL_TERM_APPROV: 'jobControlTermApprove',
  /** Контроль: срок отказать */
  JOB_CONTROL_TERM_REFUSE: 'jobControlTermRefuse',
  /** Контроль: предконтроль */
  JOB_CONTROL_BEFORE: 'jobControlBefore',
  /** Контроль: снять */
  JOB_CONTROL_CANCEL: 'jobControlCancel',

  /** ФАЙЛ: добавить */
  FILE_ADD: 'FileAdd',
  JOB_FILE_ADD: 'jobFileAdd',
  /** ФАЙЛ: удалить */
  FILE_DEL: 'fileDel',
  JOB_FILE_DEL: 'jobFileDel',
  /** Файл: скачать */
  FILE_DOWNLOAD: 'fileDownload',
  /** Файл: загрузить файл поручения */
  JOB_FILE_DOWNLOAD: 'jobFileDownload',
  /** Файл: ЭЦП подписать */
  JOB_FILE_SIGN_SET: 'jobFileSignSet',
  /** Файл: ЭЦП проверить */
  JOB_FILE_SIGN_VER: 'jobFileSignVer'
};
