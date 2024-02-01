/**
 * !!!!!!!!! ВАЖНО !!!!!!!!!!!
 * ЕДИНЫЙ ФАЛ ДЛЯ БЭКА И ФРОНТА
 * ПРИ ИЗМЕНЕНИИ ОБЯЗАТЕЛЬНО МЕНЯТЬ И ЕГО В ДРУГОМ МЕСТЕ
 */

/********************************************
 * ВОЗМОЖНЫЕ ОПЕРАЦИИ
 ********************************************/
export const ActionsProject = {
  /** Проект: подписать */
  PROJECT_SIGN: 'projectSign',
  /** Проект: исполнить стадию без замечаний */
  PROJECT_DONE_OK: 'projectDoneOk',
  /** Проект: исполнить стадию с замечаниями */
  PROJECT_DONE_REMARK: 'projectDoneRemark',
  /** Проект: вернуть на доработку */
  PROJECT_REWORK: 'projectRework',
  /** Проект: исполнитель: добавить */
  PROJECT_EXEC_ADD: 'projectExecAdd',
  /** Проект: исполнитель: удалить */
  PROJECT_EXEC_DEL: 'projectExecDel',
  /** Проект: закрыть */
  PROJECT_CLOSE: 'projectClose',
  /** Проект: удалить */
  PROJECT_DEL: 'projectDel',

  /** ФАЙЛ: добавить */
  PROJECT_FILE_ADD: 'projectFileAdd',
  /** ФАЙЛ: удалить */
  PROJECT_FILE_DEL: 'projectFileDel',
  /** Файл: скачать */
  PROJECT_FILE_DOWNLOAD: 'projectFileDownload',
  /** Файл: подписать */
  PROJECT_FILE_SIGN: 'projectFileSign',
  /** Этап Визировать (Кнопка) */
  PROJECT_STAGE_CONFIRM: 'checkStageWithConfirm'
};
