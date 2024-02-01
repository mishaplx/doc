import { registerEnumType } from "@nestjs/graphql";

/** ТИПЫ СЕССИЙ */
export enum UserSessionTypeEnum {
  /** обычный пользователь */
  person = 'person',
  /** api-доступ: общий для внешних устройств */
  api_common = 'api_common',
  /** api-доступ: редактирование файла */
  api_file_edit = 'api_file_edit',
}

registerEnumType(UserSessionTypeEnum, {
  name: "UserSessionTypeEnum",
  description: "Типы сессий",
  valuesMap: {
    person: {
      description: "обычный пользователь",
    },
    api_common: {
      description: "api-доступ: общий для внешних устройств",
    },
    api_file_edit: {
      description: "api-доступ: редактирование файла",
    },
  },
});
