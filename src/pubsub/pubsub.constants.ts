import { registerEnumType } from "@nestjs/graphql";
import { PsBaseCodeEnum, PsBaseEnum, PsEnum } from "../BACK_SYNC_FRONT/enum/enum.pubsub";

registerEnumType(PsEnum, {
  name: "PsEnum",
  description: "Типы оповещений",
  valuesMap: {
    base: {
      description: "Базовое",
    },
  },
});

registerEnumType(PsBaseEnum, {
  name: "PsBaseEnum",
  description: "Типы базовых оповещений",
  valuesMap: {
    success: {
      description: "Сообщение: успешно",
    },
    error: {
      description: "Сообщение: ошибка",
    },
    warning: {
      description: "Сообщение: предупреждение",
    },
    info: {
      description: "Сообщение: инфо",
    },
    sys: {
      description: "Системное событие",
    },
  },
});

registerEnumType(PsBaseCodeEnum, {
  name: "PsBaseCodeEnum",
  description: "Коды (для системных оповещений)",
  valuesMap: {
    notify_refresh: {
      description: "Обновлен список уведомлений",
    },
  },
});
