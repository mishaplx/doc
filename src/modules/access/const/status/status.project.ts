import { ProjectStatus } from "../../../projects/projects.const";
import { ActionsProject } from "../../../../BACK_SYNC_FRONT/actions/actions.project";

/********************************************
 * ДОПУСТИМЫЕ СТАТУСЫ ДЛЯ КАЖДОЙ ОПЕРАЦИИ
 ********************************************/
export const ACCESS_STATUS_PROJECT = {
  /** Проект: подписать */
  [ActionsProject.PROJECT_SIGN]: [ProjectStatus.NEW, ProjectStatus.FIX],

  /** Проект: исполнить стадию без замечаний */
  [ActionsProject.PROJECT_DONE_OK]: [ProjectStatus.INWORK],
  /** Проект: исполнить стадию с замечаниями */
  [ActionsProject.PROJECT_DONE_REMARK]: [ProjectStatus.INWORK],
  /** Проект: вернуть на доработку */
  [ActionsProject.PROJECT_REWORK]: [ProjectStatus.INWORK],
  /** Проект: исполнитель: добавить */
  [ActionsProject.PROJECT_EXEC_ADD]: [ProjectStatus.NEW, ProjectStatus.FIX, ProjectStatus.INWORK],
  /** Проект: исполнитель: удалить */
  [ActionsProject.PROJECT_EXEC_DEL]: [ProjectStatus.NEW, ProjectStatus.FIX, ProjectStatus.INWORK],
  /** Проект: закрыть */
  [ActionsProject.PROJECT_CLOSE]: [ProjectStatus.INWORK],

  /** Проект: удалить */
  [ActionsProject.PROJECT_DEL]: [ProjectStatus.NEW, ProjectStatus.INWORK],

  /**
   * ФАЙЛЫ ПО ПРОЕКТУ
   */

  /** Файл: добавить */
  [ActionsProject.PROJECT_FILE_ADD]: [ProjectStatus.NEW, ProjectStatus.INWORK],

  /** Файл: удалить */
  [ActionsProject.PROJECT_FILE_DEL]: [ProjectStatus.NEW, ProjectStatus.INWORK],

  /** Файл: скачать */
  [ActionsProject.PROJECT_FILE_DOWNLOAD]: [ProjectStatus.NEW, ProjectStatus.INWORK],

  /** Файл: подписать */
  [ActionsProject.PROJECT_FILE_SIGN]: [ProjectStatus.NEW, ProjectStatus.INWORK],
};
export type ACCESS_STATUS_PROJECT = typeof ACCESS_STATUS_PROJECT;
