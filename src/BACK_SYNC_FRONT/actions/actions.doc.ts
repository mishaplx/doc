/**
 * !!!!!!!!! ВАЖНО !!!!!!!!!!!
 * ЕДИНЫЙ ФАЛ ДЛЯ БЭКА И ФРОНТА
 * ПРИ ИЗМЕНЕНИИ ОБЯЗАТЕЛЬНО МЕНЯТЬ И ЕГО В ДРУГОМ МЕСТЕ
 */

/********************************************
 * ВОЗМОЖНЫЕ ОПЕРАЦИИ
 ********************************************/
export const ActionsDoc = {
  /** Документ: удалить */
  DOC_DEL: 'docDel',

  /** КОРРЕСПОНДЕНТ: добавить */
  DOC_CORR_ADD: 'docCorrAdd',

  /** ОТПРАВИТЬ: EMAIL */
  DOC_SEND_EMAIL: 'docSendEmail',
  /** ОТПРАВИТЬ: СМДО */
  DOC_SEND_SMDO: 'docSendSmdo',
  /** ОТПРАВИТЬ: ИСТОРИЯ */
  DOC_SEND_HISTORY: 'docSendHistory',

  /** ФАЙЛ: добавить */
  DOC_FILE_ADD: 'docFileAdd',
  /** ФАЙЛ: удалить */
  DOC_FILE_DEL: 'docFileDel',
  /** Файл: скачать */
  DOC_FILE_DOWNLOAD: 'docFileDownload',
  /** Файл: подписать */
  DOC_FILE_SIGN: 'docFileSign'
};
