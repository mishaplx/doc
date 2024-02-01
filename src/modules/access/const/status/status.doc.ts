import { ActionsDoc } from "../../../../BACK_SYNC_FRONT/actions/actions.doc";
import { DocStatus } from "../../../doc/doc.const";

/********************************************
 * ДОПУСТИМЫЕ СТАТУСЫ ДЛЯ КАЖДОЙ ОПЕРАЦИИ
 ********************************************/
export const ACCESS_STATUS_DOC = {
  /** Удалить документ */
  [ActionsDoc.DOC_DEL]: [DocStatus.NEWDOC.id, DocStatus.INREGISTRATE.id],

  /**
   * ОТПРАВКА ДОКУМЕНТА
   */

  /** ОТПРАВКА: Email */
  [ActionsDoc.DOC_SEND_EMAIL]: [
    DocStatus.REGISTRATE.id,
    DocStatus.INVIEW.id,
    DocStatus.INDO.id,
    DocStatus.DONE,
    DocStatus.INWORK,
    DocStatus.NOTREGISTER,
  ],

  /** ОТПРАВКА: SMDO */
  [ActionsDoc.DOC_SEND_SMDO]: [
    DocStatus.REGISTRATE.id,
    DocStatus.INVIEW.id,
    DocStatus.INDO.id,
    DocStatus.DONE,
    DocStatus.INWORK,
    DocStatus.NOTREGISTER,
  ],

  /** ОТПРАВКА: ИСТОРИЯ */
  [ActionsDoc.DOC_SEND_HISTORY]: [
    DocStatus.REGISTRATE.id,
    DocStatus.INVIEW.id,
    DocStatus.INDO.id,
    DocStatus.DONE,
    DocStatus.INWORK,
    DocStatus.NOTREGISTER,
  ],

  /**
   * КОРРЕСПОНДЕНТЫ ПО ДОКУМЕНТУ
   */

  /** Кореспондент: добавить */
  [ActionsDoc.DOC_CORR_ADD]: [
    DocStatus.NEWDOC.id,
    DocStatus.INREGISTRATE.id,
    DocStatus.REGISTRATE.id,
    DocStatus.INVIEW.id,
    DocStatus.INDO.id,
  ],

  /**
   * ФАЙЛЫ ПО ДОКУМЕНТУ
   */

  /** Файл: добавить */
  [ActionsDoc.DOC_FILE_ADD]: [DocStatus.NEWDOC.id, DocStatus.INREGISTRATE.id],

  /** Файл: удалить */
  [ActionsDoc.DOC_FILE_DEL]: [DocStatus.NEWDOC.id, DocStatus.INREGISTRATE.id],

  /** Файл: скачать */
  [ActionsDoc.DOC_FILE_DOWNLOAD]: [
    DocStatus.NEWDOC.id,
    DocStatus.INREGISTRATE.id,
    DocStatus.REGISTRATE.id,
    DocStatus.INVIEW.id,
    DocStatus.INDO.id,
    DocStatus.DONE.id,
    DocStatus.INWORK.id,
  ],

  /** Файл: подписать */
  [ActionsDoc.DOC_FILE_SIGN]: [DocStatus.NEWDOC.id, DocStatus.INREGISTRATE.id],
};
export type ACCESS_STATUS_DOC = typeof ACCESS_STATUS_DOC;
