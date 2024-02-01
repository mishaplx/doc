/** Типы стадий. Используется в т.ч. в сидах */
export enum ProjectActionEnum {
  /** Визирование */
  VIS = 1,
  /** Подписание */
  SIGN = 2,
  /** Утверждение */
  APPROV = 3,
}

export enum ProjectStatus {
  /**«Новый» - создан новый проект, заполнены обязательные реквизиты. В данном статусе проект может редактироваться или быть удален.*/
  NEW = 1,
  /**«В работе» - проект отправлен по Маршруту. В данном статусе проект может быть закрыт. В данном статусе у проекта есть Этапы. Количество этапов зависит от Маршрута.*/

  INWORK = 2,
  /**«На доработке» - проект возвращен на доработку с указанием причины возврата. В данном статусе проект может редактироваться.*/
  FIX = 3,
  /**
   * «Завершен» - проект успешно прошел весь маршрут.
   */

  END_WORK = 4,
  /**
   * «Закрыт» - проект закрыт.
   */

  CLOSE = 5,
}
export const projectMessageErr = {
  MessQueue: "Сейчас не ваша очередь",
  ErrorQueue: "Укажите очередь, значение которой составляет NUMBER_VALUE или более",
  MessMoreOneStage: "Проект должен содержать не менее одного этапа!",
  MessForbidden: "нет доступа",
  MessDeleteProject: "Проект можно удалить только с статусом Новый",
  MessErrDate: "Ошибка последовательности Даты",
  MessInJob: "Статус проекта в работе!",
  MessMoreExec: "На этапе должен быть хотя бы один исполнитель",
  MessMoreFile: "В проекте должен быть хотя бы один файл",
  MessSendRoute: "Вы не можете отправить проект по маршруту",
  MessMoreQueue: "Укажите правильную очередь",
  MessCheckParentExec:
    "Исполнитель может совершать действия только над другими исполнителями, которых он добавил",
  MessDontFix: "Проект нельзя отправить на доработку",
};