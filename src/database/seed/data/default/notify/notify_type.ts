import { PickType } from "@nestjs/graphql";

import { NotifyTypeEntity } from "../../../../../entity/#organization/notify/notifyType.entity";
import { NOTIFY_TYPE_GROUP, NotifyTypeEnum } from "../../../../../modules/notify/notify.const";

class NotifyTypeSeed extends PickType(NotifyTypeEntity, [
  "id",
  "notify_type_group_id",
  "name",
] as const) {}

export const notifyTypeArr: NotifyTypeSeed[] = [
  /**
   * PROJECT
   */
  {
    id: NotifyTypeEnum.PROJECT_EXEC_ADD,
    notify_type_group_id: NOTIFY_TYPE_GROUP.PROJECT.id,
    name: "Статус: участник",
  },
  {
    id: NotifyTypeEnum.PROJECT_QUEUE_ADVANCE,
    notify_type_group_id: NOTIFY_TYPE_GROUP.PROJECT.id,
    name: "Запрос: рассмотреть по существу",
  },
  {
    id: NotifyTypeEnum.PROJECT_RET_REWORK,
    notify_type_group_id: NOTIFY_TYPE_GROUP.PROJECT.id,
    name: "Решение: вернуть на доработку",
  },
  {
    id: NotifyTypeEnum.PROJECT_CLOSE,
    notify_type_group_id: NOTIFY_TYPE_GROUP.PROJECT.id,
    name: "Решение: закрыть",
  },
  {
    id: NotifyTypeEnum.PROJECT_END,
    notify_type_group_id: NOTIFY_TYPE_GROUP.PROJECT.id,
    name: "Инфо: завершение",
  },

  /**
   * DOC
   */
  {
    id: NotifyTypeEnum.DOC_GET,
    notify_type_group_id: NOTIFY_TYPE_GROUP.DOC.id,
    name: "Инфо: передача / пересылка",
  },
  // {
  //   id: NotifyTypeEnum.DOC_REG,
  //   notify_type_group_id: NOTIFY_TYPE_GROUP.DOC.id,
  //   name: "Запрос: зарегистрировать",
  // },

  /**
   * JOB
   */
  {
    id: NotifyTypeEnum.JOB_STATUS_EXEC,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Статус: исполнитель",
  },
  {
    id: NotifyTypeEnum.JOB_STATUS_RESP,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Статус: ответственный исполнитель",
  },
  {
    id: NotifyTypeEnum.JOB_STATUS_CONTROL,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Статус: контролер",
  },
  {
    id: NotifyTypeEnum.JOB_STATUS_PRECONTROL,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Статус: предконтролер",
  },

  // =========================================
  {
    id: NotifyTypeEnum.JOB_REQUEST_APPROV,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Запрос: на утверждение",
  },
  {
    id: NotifyTypeEnum.JOB_REQUEST_TERM,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Запрос: на продление срока",
  },

  // =========================================
  {
    id: NotifyTypeEnum.JOB_RESOLV_REEXEC,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Решение: вернуть на исполнение",
  },
  {
    id: NotifyTypeEnum.JOB_RESOLV_REWORK,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Решение: вернуть на доработку",
  },
  {
    id: NotifyTypeEnum.JOB_RESOLV_APPROV,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Решение: утвердить",
  },
  {
    id: NotifyTypeEnum.JOB_RESOLV_TERM,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Решение: срок продлить / не продлить",
  },
  {
    id: NotifyTypeEnum.JOB_RESOLV_CONTROL_OFF,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Решение: снять с контроля",
  },
  {
    id: NotifyTypeEnum.JOB_RESOLV_DELETE,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Решение: удалить",
  },

  // =========================================
  // {
  //   id: NotifyTypeEnum.JOB_INFO_TERM,
  //   notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
  //   name: "Инфо: контроль срока",
  // },
  {
    id: NotifyTypeEnum.JOB_INFO_FULFILLED,
    notify_type_group_id: NOTIFY_TYPE_GROUP.JOB.id,
    name: "Инфо: исполнено",
  },

  /**
   * SERVER
   */
  {
    id: NotifyTypeEnum.SERVER_ERROR,
    notify_type_group_id: NOTIFY_TYPE_GROUP.SERVER.id,
    name: "Отложенная задача: ошибка",
  },
  {
    id: NotifyTypeEnum.SERVER_WARNING,
    notify_type_group_id: NOTIFY_TYPE_GROUP.SERVER.id,
    name: "Отложенная задача: предупреждение",
  },
  {
    id: NotifyTypeEnum.SERVER_INFO,
    notify_type_group_id: NOTIFY_TYPE_GROUP.SERVER.id,
    name: "Отложенная задача: инфо",
  },
  {
    id: NotifyTypeEnum.SERVER_SUCCESS,
    notify_type_group_id: NOTIFY_TYPE_GROUP.SERVER.id,
    name: "Отложенная задача: успех",
  },

  /**
   * ANY
   */
  {
    id: NotifyTypeEnum.ANY_EMP_CHANGE,
    notify_type_group_id: NOTIFY_TYPE_GROUP.ANY.id,
    name: "Статус: назначение",
  },
  // {
  //   id: NotifyTypeEnum.ANY_MAIL_SEND,
  //   notify_type_group_id: NOTIFY_TYPE_GROUP.ANY.id,
  //   name: "Отправка",
  // },
  // {
  //   id: NotifyTypeEnum.ANY_FILE_CONVERT_TRUE,
  //   notify_type_group_id: NOTIFY_TYPE_GROUP.ANY.id,
  //   name: "Конвертация успешна",
  // },

  // {
  //   id: NotifyTypeEnum.SYS,
  //   notify_type_group_id: NOTIFY_TYPE_GROUP.ANY.id,
  //   name: "Системные сообщения",
  // },
];
