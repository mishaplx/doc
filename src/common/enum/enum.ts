import { registerEnumType } from "@nestjs/graphql";

import { JobLoopKindEnum, JobLoopMonthEnum } from "../../BACK_SYNC_FRONT/enum/enum.job";

/**
 * ПРЕДПОЧТИТЕЛЬНО ENUM РАЗМЕЩАТЬ В ОБЩЕЙ ПАПКЕ ДЛЯ FRONT И BACK
 * ЗДЕСЬ ТОЛЬКО ИХ РЕГИСТРАЦИЯ
 */

registerEnumType(JobLoopKindEnum, {
  name: "JobLoopKindEnum",
  description: "Повтор: виды",
  valuesMap: {
    day: {
      description: "День",
    },
    week: {
      description: "Неделя",
    },
    month: {
      description: "Месяц",
    },
    year: {
      description: "Год",
    },
  },
});

registerEnumType(JobLoopMonthEnum, {
  name: "JobLoopMonthEnum",
  description: "Повторы для месяца",
  valuesMap: {
    day_n: {
      description: "Пример: N числа",
    },
    day_last: {
      description: "Пример: последний день месяца",
    },
    week_n: {
      description: "Пример: Пн. N-й недели",
    },
    week_last: {
      description: "Пример: последний Пн.месяца",
    },
  },
});

/** префикс кастомного сообщения об ошибке */
export const PREF_ERR = "<!>";

/** константы для обеспечения мультиязыковой поддержки */
export const MSG = {
  SUCCESS: {
    COMMON: "Операция выполнена успешно",
  },
  ERROR: {
    COMMON: "Ошибка выполнения запроса ",
  },

  /** ПОРУЧЕНИЯ */
  JOB: {
    ERROR: {
      NOT_SAVED: "Поручение еще не сохранено",
    },
  },
};

export const FORWARDING_STATUS = {
  STATUS_VEIW: {
    id: 1,
    name: "Просмотренно",
  },
  STATUS_NOT_VEIW: {
    id: 2,
    name: "Непросмотренно",
  },
};

export const FORWARDING_VIEW = {
  VEIW: {
    id: 1,
    name: "В работу",
  },
  NOT_VEIW: {
    id: 2,
    name: "Рассылка",
  },
};

/** Оператор сортировки */
export enum SortEnum {
  /** По возрастанию */
  ASC = "ASC",
  /** По убыванию */
  DESC = "DESC",
}

registerEnumType(SortEnum, {
  name: "SortEnum",
  description: "Оператор сортировки.",
  valuesMap: {
    ASC: {
      description: "Данные сортируются по возрастанию.",
    },
    DESC: {
      description: "Данные сортируются по убыванию.",
    },
  },
});

/** Участники проекта */
export enum PartiesProjects {
  /** Создатель */
  CREATED = 1,
  /** Участник (Визирование, подписание, утверждение)*/
  PARTICIPANT = 2,
  /** Участник (Визирование)*/
  PARTICIPANT_VISE = 3,
  /** Участник (Подписание)*/
  PARTICIPANT_SIGN = 4,
  /** Участник (Утверждение)*/
  PARTICIPANT_APPROVE = 5,
}

registerEnumType(PartiesProjects, {
  name: "PartiesProjects",
  description: "Участники проекта.",
  valuesMap: {
    CREATED: {
      description: "Создатель.",
    },
    PARTICIPANT: {
      description: "Участник (Визирование, подписание, утверждение).",
    },
    PARTICIPANT_VISE: {
      description: "Участник (Визирование).",
    },
    PARTICIPANT_SIGN: {
      description: "Участник (Подписание).",
    },
    PARTICIPANT_APPROVE: {
      description: "Участник (Утверждение).",
    },
  },
});

/** Поля сортировки проектов */
export enum OrderProjectsEnum {
  /** № */
  id = 1,
  /** Дата создания */
  dtc = 2,
  /** Наименование */
  nm = 3,
  /** Тип документа */
  typeDocument = 4,
  /** Вид документа */
  viewDocument = 5,
  /** Статус */
  status = 6,
  /** Этап */
  currentStage = 7,
  /** Исполнитель */
  executor = 8,
  /** Документ */
  doc = 9,
  short_body = 10,
}

registerEnumType(OrderProjectsEnum, {
  name: "OrderProjectsEnum",
  description: "Поля сортировки проектов.",
  valuesMap: {
    id: {
      description: "№.",
    },
    dtc: {
      description: "Дата создания.",
    },
    nm: {
      description: "Наименование.",
    },
    typeDocument: {
      description: "Тип документа.",
    },
    viewDocument: {
      description: "Вид документа.",
    },
    status: {
      description: "Статус.",
    },
    currentStage: {
      description: "Этап.",
    },
    executor: {
      description: "Исполнитель.",
    },
    doc: {
      description: "Документ.",
    },
  },
});

/** Поля сортировки ролей пользователя */
export enum OrderRolesEnum {
  /** Наименование */
  name = 1,
  /** Примечание */
  nt = 2,
  /** Дата обновления */
  update_at = 3,
  /** Редактор */
  editor = 4,
  /** Блокировка роли */
  locked = 5,
}

registerEnumType(OrderRolesEnum, {
  name: "OrderRolesEnum",
  description: "Поля сортировки ролей пользователя.",
  valuesMap: {
    name: {
      description: "Наименование.",
    },
    nt: {
      description: "Примечание.",
    },
    update_at: {
      description: "Дата обновления.",
    },
    editor: {
      description: "Редактор.",
    },
    locked: {
      description: "Блокировка роли.",
    },
  },
});

/** Поля сортировки справочника "типы связок" */
export enum OrderRefTypesEnum {
  /** Прямая связка */
  name_direct = 1,
  /** Обратная связка */
  name_reverse = 2,
}

registerEnumType(OrderRefTypesEnum, {
  name: "OrderRefTypesEnum",
  description: 'Поля сортировки справочника "типы связок".',
  valuesMap: {
    name_direct: {
      description: "Прямая связка.",
    },
    name_reverse: {
      description: "Обратная связка.",
    },
  },
});

/** Поля сортировки справочника "сотрудники" */
export enum OrderStaffEnum {
  /** Имя */
  nm = 1,
  /** Фамилия */
  ln = 2,
  /** Отчество */
  mn = 3,
  /** Эл. почта */
  eml = 4,
  /** Телефон */
  phone = 5,
  /** Дата рожд. */
  dob = 6,
  /** Табельный номер */
  personnal_number = 7,
}

registerEnumType(OrderStaffEnum, {
  name: "OrderStaffEnum",
  description: 'Поля сортировки справочника "сотрудники".',
  valuesMap: {
    nm: {
      description: "Имя",
    },
    ln: {
      description: "Фамилия",
    },
    mn: {
      description: "Отчество",
    },
    eml: {
      description: "Эл. почта",
    },
    phone: {
      description: "Телефон",
    },
    dob: {
      description: "Дата рожд",
    },
    personnal_number: {
      description: "Табельный номер",
    },
  },
});

/** Поля сортировки справочника "статьи хранения" */
export enum OrderArticleEnum {
  /** Наименование */
  nm = 1,
  /** Статья хранения */
  cd = 2,
  /** Срок хранения */
  term_nm = 3,
  /** Актуальность */
  is_actual = 4,
}

registerEnumType(OrderArticleEnum, {
  name: "OrderArticleEnum",
  description: 'Поля сортировки справочника "статьи хранения".',
  valuesMap: {
    nm: {
      description: "Наименование.",
    },
    cd: {
      description: "Статья хранения.",
    },
    term_nm: {
      description: "Срок хранения.",
    },
    is_actual: {
      description: "Актуальность.",
    },
  },
});

/** Поля сортировки справочника "подразделения" */
export enum OrderUnitEnum {
  /** Код подразделения */
  code = 1,
  /** Наименование */
  nm = 2,
  /** Сокращенное наименование */
  short_name = 3,
  /** Дата с */
  db = 4,
  /** Дата по */
  de = 5,
  /** Вышестоящее подразделение */
  parent_unit = 6,
}

registerEnumType(OrderUnitEnum, {
  name: "OrderUnitEnum",
  description: 'Поля сортировки справочника "подразделения".',
  valuesMap: {
    code: {
      description: "Код подразделения.",
    },
    nm: {
      description: "Наименование.",
    },
    short_name: {
      description: "Сокращенное наименование.",
    },
    db: {
      description: "Дата с.",
    },
    de: {
      description: "Дата по.",
    },
    parent_unit: {
      description: "Вышестоящее подразделение.",
    },
  },
});

/** Поля сортировки справочника "абоненты СМДО." */
export enum OrderAbonentsEnum {
  /** Наименование */
  nm = 1,
  /** Сокращённое наименование */
  short_nm = 2,
  /** Код */
  smdo_code = 3,
  /** Id записи */
  row_id = 4,
  /** Статус подписчика */
  status_smdo = 5,
}

registerEnumType(OrderAbonentsEnum, {
  name: "OrderAbonentsEnum",
  description: 'Поля сортировки справочника "абоненты СМДО".',
  valuesMap: {
    nm: {
      description: "Наименование.",
    },
    short_nm: {
      description: "Сокращённое наименование.",
    },
    smdo_code: {
      description: "Код.",
    },
    row_id: {
      description: "Id записи.",
    },
    status_smdo: {
      description: "Статус подписчика.",
    },
  },
});

/** Поля сортировки справочника "пакеты СМДО." */
export enum OrderPackagesEnum {
  /** ID */
  id = "id",
  /** Тип */
  type = "type",
  /** Статус пакета */
  status = "status",
  /** Тип пакета, квитанция=true */
  ack = "ack",
  /** Тип квитанции */
  ackType = "ackType",
}

registerEnumType(OrderPackagesEnum, {
  name: "OrderPackagesEnum",
  description: 'Поля сортировки справочника "пакеты СМДО".',
  valuesMap: {
    id: {
      description: "ID",
    },
    type: {
      description: "Тип",
    },
    status: {
      description: "Статус пакета",
    },
    ack: {
      description: "Тип пакета, квитанция=true",
    },
    ackType: {
      description: "Тип квитанции",
    },
  },
});

/** Поля сортировки справочника "очередь СМДО." */
export enum OrderStackEnum {
  /** ID */
  id = "id",
  /** Тело */
  body = "body",
  /** Признак активности */
  is_active = "is_active",
  /** Последняя отправка */
  send_time = "send_time",
  /** Дата создания */
  dtc = "dtc",
  /** Вид документа */
  tdoc = "tdoc",
  /** Рег. номер документа */
  regNum = "regNum",
  /** Заголовок */
  title = "title",
  /** Получатели */
  receivers = "receivers",
}

registerEnumType(OrderStackEnum, {
  name: "OrderStackEnum",
  description: 'Поля сортировки справочника "очередь пакетов СМДО".',
  valuesMap: {
    id: {
      description: "ID",
    },
    body: {
      description: "Тело",
    },
    is_active: {
      description: "Признак активности",
    },
    send_time: {
      description: "Последняя отправка",
    },
    dtc: {
      description: "Дата создания",
    },
    tdoc: {
      description: "Вид документа",
    },
    regNum: {
      description: "Рег. номер документа",
    },
    title: {
      description: "Заголовок",
    },
    receivers: {
      description: "Получатели",
    },
  },
});

/** Поля сортировки справочника групп */
export enum OrderGroupEnum {
  /** ID */
  id = "id",
  /** Дата создания */
  dtc = "dtc",
  /** Наименование */
  nm = "nm",
  /** Подразделения */
  units = "units",
}

registerEnumType(OrderGroupEnum, {
  name: "OrderGroupEnum",
  description: "Поля сортировки справочника групп",
  valuesMap: {
    id: {
      description: "ID",
    },
    dtc: {
      description: "Дата создания",
    },
    nm: {
      description: "Наименование",
    },
    units: {
      description: "Подразделения",
    },
  },
});

/** Поля сортировки справочника "физ. лиц." */
export enum OrderCitizenEnum {
  /** Фамилия */
  ln = 1,
  /** Имя */
  nm = 2,
  /** Отчество */
  mn = 3,
  /** Регион(город) */
  region = 4,
  /** Адрес */
  addr = 5,
  /** Электронная почта */
  email = 6,
}

registerEnumType(OrderCitizenEnum, {
  name: "OrderCitizenEnum",
  description: 'Поля сортировки справочника "физ. лиц.".',
  valuesMap: {
    ln: {
      description: "Фамилия.",
    },
    nm: {
      description: "Имя.",
    },
    mn: {
      description: "Отчество.",
    },
    region: {
      description: "Регион(город).",
    },
    addr: {
      description: "Адрес.",
    },
    email: {
      description: "Электронная почта.",
    },
  },
});

/** Поля сортировки справочника "пользователи" */
export enum OrderAuthEnum {
  /** ФИО */
  fio = 1,
  /** Дата регистрации */
  dtc = 2,
  /** Логин */
  login = 3,
  /** Табельный номер */
  personnal_number = 4,
}

registerEnumType(OrderAuthEnum, {
  name: "OrderAuthEnum",
  description: 'Поля сортировки справочника "пользователи"',
  valuesMap: {
    fio: {
      description: "ФИО",
    },
    dtc: {
      description: "Дата регистрации",
    },
    login: {
      description: "Логин",
    },
    personnal_number: {
      description: "Табельный номер",
    },
  },
});

/** Поля сортировки справочника "организации" */
export enum OrderOrgEnum {
  /** Наименование (полное) */
  fnm = 1,
  /** Наименование (сокращённое) */
  nm = 2,
  /** Регион (город) */
  region = 3,
  /** Адрес */
  adress = 4,
  /** Телефон */
  phone = 5,
  /** Факс */
  fax = 6,
  /** Электронная почта */
  email = 7,
  /** Название в СМД */
  smdo_abonent = 8,
}

/** Поля сортировки справочника "организации" */
export enum OrderTemplateContentEnum {
  /** текст */
  text = 2,
}

export enum OrderReceiverEnum {
  /** текст */
  receiver_name = 1,
}

registerEnumType(OrderReceiverEnum, {
  name: "OrderReceiverEnum",
  description: 'Поля сортировки справочника "Адресатов".',
  valuesMap: {
    receiver_name: {
      description: "Наименование (полное).",
    },
  },
});

registerEnumType(OrderTemplateContentEnum, {
  name: "OrderTemplateContentEnum",
  description: 'Поля сортировки справочника "шаблон содержаний".',
  valuesMap: {
    text: {
      description: "Наименование (полное).",
    },
  },
});

registerEnumType(OrderOrgEnum, {
  name: "OrderOrgEnum",
  description: 'Поля сортировки справочника "организации".',
  valuesMap: {
    fnm: {
      description: "Наименование (полное).",
    },
    nm: {
      description: "Наименование (сокращённое).",
    },
    region: {
      description: "Регион (город).",
    },
    adress: {
      description: "Адрес.",
    },
    phone: {
      description: "Телефон.",
    },
    fax: {
      description: "Электронная почта.",
    },
    email: {
      description: "Электронная почта.",
    },
    smdo_abonent: {
      description: "Название в СМД.",
    },
  },
});

/** Поля сортировки справочника "текущие назначения" */
export enum OrderEmpEnum {
  /** Должность */
  post = 1,
  /** ФИО */
  fio = 2,
  /** Подразделение */
  unit = 3,
  /** Дата назначения */
  db = 4,
  /** Дата прекращения */
  de = 5,
  /** Табельный номер */
  personnal_number = 6,
}

registerEnumType(OrderEmpEnum, {
  name: "OrderEmpEnum",
  description: 'Поля сортировки справочника "текущие назначения"',
  valuesMap: {
    post: {
      description: "Должность",
    },
    fio: {
      description: "ФИО",
    },
    unit: {
      description: "Подразделение",
    },
    db: {
      description: "Дата назначения",
    },
    de: {
      description: "Дата прекращения",
    },
    personnal_number: {
      description: "Табельный номер",
    },
  },
});

/** Поля сортировки справочника "нумераторы" */
export enum OrderNumEnum {
  /** Образец */
  num_param_sel = 1,
  /** Наименование нумератора */
  name = 2,
  /** Тип документа */
  kdoc = 3,
  /** Дата начала */
  date_start = 4,
  /** Дата завершения */
  date_end = 5,
  /** Примечание */
  note = 6,
}

registerEnumType(OrderNumEnum, {
  name: "OrderNumEnum",
  description: 'Поля сортировки справочника "нумераторы".',
  valuesMap: {
    num_param_sel: {
      description: "Образец.",
    },
    name: {
      description: "Наименование нумератора.",
    },
    kdoc: {
      description: "Тип документа.",
    },
    date_start: {
      description: "Дата начала.",
    },
    date_end: {
      description: "Дата завершения.",
    },
    note: {
      description: "Примечание.",
    },
  },
});

/** Поля сортировки справочника "замещения" */
export enum OrderEmpReplaceEnum {
  /** Должность */
  post = 1,
  /** Заменяемый */
  emp_whom = 2,
  /** Заменяющий */
  emp_who = 3,
  /** Дата с */
  date_start = 4,
  /** Дата по */
  date_end = 5,
}

registerEnumType(OrderEmpReplaceEnum, {
  name: "OrderEmpReplaceEnum",
  description: 'Поля сортировки справочника "замещения".',
  valuesMap: {
    post: {
      description: "Должность.",
    },
    emp_whom: {
      description: "Заменяемый.",
    },
    emp_who: {
      description: "Заменяющий.",
    },
    date_start: {
      description: "Дата с.",
    },
    date_end: {
      description: "Дата по.",
    },
  },
});

/** Поля сортировки справочника "шаблоны маршутов" */
export enum OrderProjectsTemplateEnum {
  /** Наименование шаблона */
  name = 1,
  /** Тип документа */
  type_doc = 2,
  /** Вид документа */
  view_doc = 3,
}

registerEnumType(OrderProjectsTemplateEnum, {
  name: "OrderProjectsTemplateEnum",
  description: 'Поля сортировки справочника "шаблоны маршутов".',
  valuesMap: {
    name: {
      description: "Наименование шаблона.",
    },
    type_doc: {
      description: "Тип документа.",
    },
    view_doc: {
      description: "Вид документа.",
    },
  },
});

/** Поля сортировки документов */
export enum OrderDocEnum {
  /** Автор */
  author = 1,
  /** Содержание */
  body = 2,
  /** Рег.№ */
  regNum = 3,
  /** Вид документа */
  tdoc = 4,
  /** От */
  dr = 5,
  /** Доступ */
  priv = 6,
  /** Корреспондент */
  citizen = 7,
  /** Исх.№(номер) */
  outnum = 8,
  /** Исходящая дата */
  outd = 9,
  /** Подписал */
  signed = 10,
  /** Примечание */
  nt = 11,
  /** Статус документа */
  docstatus = 12,
  /** Тип доставки */
  delivery = 13,
  /** Тип документа */
  cls = 14,
  /** Индекс дела */
  doc_package_index = 15,
  /** Статус дела */
  doc_package_status = 16,
}

registerEnumType(OrderDocEnum, {
  name: "OrderDocEnum",
  description: "Поля сортировки дел.",
  valuesMap: {
    author: {
      description: "Автор.",
    },
    body: {
      description: "Содержание.",
    },
    regNum: {
      description: "Рег.№.",
    },
    tdoc: {
      description: "Вид документа.",
    },
    dr: {
      description: "От.",
    },
    priv: {
      description: "Доступ.",
    },
    citizen: {
      description: "Корреспондент.",
    },
    outnum: {
      description: "Исх.№(номер).",
    },
    outd: {
      description: "Исходящая дата.",
    },
    signed: {
      description: "Подписал.",
    },
    nt: {
      description: "Примечание.",
    },
    docstatus: {
      description: "Статус документа.",
    },
    delivery: {
      description: "Тип доставки.",
    },
    cls: {
      description: "Тип документа.",
    },
    doc_package_index: {
      description: "Индекс дела .",
    },
    doc_package_status: {
      description: "Статус дела.",
    },
  },
});

/** Поля сортировки аудита */
export enum OrderAuditEnum {
  /** № */
  id = "id",
  /** Дата события */
  dtc = "dtc",
  /** IP Адрес */
  ip = "ip",
  /** Тип */
  type = "type",
  /** Событие */
  event = "event",
  /** Описание */
  description = "description",
  /** Фио */
  fio = "staff_id",
}

registerEnumType(OrderAuditEnum, {
  name: "OrderAuditEnum",
  description: "Поля сортировки аудита",
  valuesMap: {
    id: {
      description: "№.",
    },
    dtc: {
      description: "Дата события",
    },
    ip: {
      description: "IP Адрес",
    },
    type: {
      description: "Тип",
    },
    event: {
      description: "Событие",
    },
    description: {
      description: "Описание",
    },
    fio: {
      description: "Фио",
    },
  },
});

/** Поля сортировки операций аудита */
export enum OrderAuditOperationsEnum {
  /** № */
  id = "id",
  /** Тип */
  type = "type",
  /** Наименование */
  name = "name",
  /** Метод */
  method = "method",
  /** Признак включения */
  is_enabled = "is_enabled",
}

registerEnumType(OrderAuditOperationsEnum, {
  name: "OrderAuditOperationsEnum",
  description: "Поля сортировки аудита",
  valuesMap: {
    id: {
      description: "№.",
    },
    type: {
      description: "Тип",
    },
    name: {
      description: "Наименование",
    },
    method: {
      description: "Метод",
    },
    is_enabled: {
      description: "Признак включения",
    },
  },
});

/** Поля сортировки типов поручений */
export enum OrderTypeJobEnum {
  /** № */
  id = "id",
  /** Тип поручения*/
  nm = "nm",
  /** Автор */
  author = "author",

}

registerEnumType(OrderTypeJobEnum, {
  name: "OrderTypeJobEnum",
  description: "Поля сортировки типов поручений",
  valuesMap: {
    id: {
      description: "№.",
    },
    nm: {
      description: "Тип поручения",
    },
    author: {
      description: "Автор",
    },
  },
});

/** Поля сортировки шаблонов проекта */
export enum OrderProjectTemplateEnum {
  /** № */
  id = "id",
  /** Дата события */
  dtc = "dtc",
  /** Наименование шаблона */
  nm = "nm",
}

registerEnumType(OrderProjectTemplateEnum, {
  name: "OrderProjectTemplateEnum",
  description: "Поля сортировки аудита",
  valuesMap: {
    id: {
      description: "№.",
    },
    dtc: {
      description: "Дата события",
    },
    nm: {
      description: "Событие",
    },
  },
});

/** Поля сортировки поиска документов */
export enum OrderDocSearchEnum {
  /** № */
  id = 1,
  /** Содержание */
  body = 2,
  /** Вид документа */
  kdoc_nm = 3,
  /** Тип документа */
  tdoc_nm = 4,
  /** Статус документа */
  docstatus_nm = 5,
  /** Регистрационный номер */
  reg_num = 6,
  /** ФИО Исполнителя */
  exec_staff_fio = 7,
  /** ФИО Автора */
  author_staff_fio = 8,
}

registerEnumType(OrderDocSearchEnum, {
  name: "OrderDocSearchEnum",
  description: "Поля сортировки поиска документов",
  valuesMap: {
    id: {
      description: "№.",
    },
    body: {
      description: "Содержание",
    },
    kdoc_nm: {
      description: "Вид документа",
    },
    tdoc_nm: {
      description: "Тип документа",
    },
    docstatus_nm: {
      description: "Статус документа",
    },
    reg_num: {
      description: "Регистрационный номер",
    },
    exec_staff_fio: {
      description: "ФИО Исполнителя",
    },
    author_staff_fio: {
      description: "ФИО Автора",
    },
  },
});

/** Поля сортировки дел */
export enum OrderDocPackagesEnum {
  /** № */
  id = 1,
  /** Индекс */
  ind = 2,
  /** Наименование */
  name = 3,
  /** Комментарий по хранению */
  storage_comment = 4,
  /** Примечание */
  nt = 5,
  /** Статья хранения */
  article_id = 6,
  /** Срок хранения */
  term = 7,
  /** Статус */
  status_id = 8,
  /** Опись */
  inventory_name = 9,
  /** Год */
  year = 10,
  /** Количество документов */
  count_doc = 11,
  /** Количество файлов */
  count_file = 12,
  /** Начальная дата документов */
  start_date = 13,
  /** Конечная дата документов */
  end_date = 14,
}

registerEnumType(OrderDocPackagesEnum, {
  name: "OrderDocPackagesEnum",
  description: "Поля сортировки дел.",
  valuesMap: {
    id: {
      description: "№.",
    },
    ind: {
      description: "Индекс.",
    },
    name: {
      description: "Наименование.",
    },
    storage_comment: {
      description: "Комментарий по хранению.",
    },
    nt: {
      description: "Примечание.",
    },
    article_id: {
      description: "Статья хранения.",
    },
    term: {
      description: "Срок хранения.",
    },
    status_id: {
      description: "Статус.",
    },
    inventory_name: {
      description: "Опись.",
    },
    year: {
      description: "Год.",
    },
    count_doc: {
      description: "Количество документов.",
    },
    count_file: {
      description: "Количество файлов.",
    },
    start_date: {
      description: "Начальная дата документов.",
    },
    end_date: {
      description: "Конечная дата документов.",
    },
  },
});

/** Поля сортировки удалённых дел */
export enum OrderDocPackagesDeletedEnum {
  /** № */
  id = 1,
  /** Акт */
  act_id = 2,
  /** Статья хранения */
  article_storage = 3,
  /** Комментарий по хранению */
  comment = 4,
  /** Количество документов */
  count_doc = 5,
  /** Количество файлов */
  count_file = 6,
  /** Дата создания */
  dtc = 7,
  /** Конечная дата документов */
  end_date = 8,
  /** Индекс */
  index = 9,
  /** Примечание */
  nt = 10,
  /** Начальная дата документов */
  start_date = 11,
  /** Срок хранения */
  storage_period = 12,
  /** Заголовок */
  title = 13,
  /** Год */
  year = 14,
}

registerEnumType(OrderDocPackagesDeletedEnum, {
  name: "OrderDocPackagesDeletedEnum",
  description: "Поля сортировки удалённых дел.",
  valuesMap: {
    id: {
      description: "№.",
    },
    act_id: {
      description: "Акт.",
    },
    article_storage: {
      description: "Статья хранения.",
    },
    comment: {
      description: "Комментарий по хранению.",
    },
    count_doc: {
      description: "Количество документов.",
    },
    count_file: {
      description: "Количество файлов.",
    },
    dtc: {
      description: "Дата создания.",
    },
    end_date: {
      description: "Конечная дата документов.",
    },
    index: {
      description: "Индекс.",
    },
    nt: {
      description: "Примечание.",
    },
    start_date: {
      description: "Начальная дата документов.",
    },
    storage_period: {
      description: "Срок хранения.",
    },
    title: {
      description: "Заголовок.",
    },
    year: {
      description: "Год.",
    },
  },
});

/** Поля сортировки справочника */
export enum OrderCatalogEnum {
  /** Наименование */
  nm = 1,
}

registerEnumType(OrderCatalogEnum, {
  name: "OrderCatalogEnum",
  description: "Поля сортировки справочника.",
  valuesMap: {
    nm: {
      description: "Наименование.",
    },
  },
});

/** Поля сортировки справочника "виды документов" */
export enum OrderTdocEnum {
  /** Наименование вида документа*/
  nm = 1,
  /** Код вида документа */
  code = 2,
  /** Название в СМДО */
  smdoDocTypes = 3,
}

registerEnumType(OrderTdocEnum, {
  name: "OrderTdocEnum",
  description: 'Поля сортировки справочника "виды документов"',
  valuesMap: {
    nm: {
      description: "Наименование вида документа",
    },
    code: {
      description: "Код вида документа",
    },
    smdoDocTypes: {
      description: "Название в СМДО",
    },
  },
});

/** Поля сортировки справочника */
export enum OrderControlTypesEnum {
  /** Наименование */
  nm = 1,
  /** Ответственный контролер */
  controller = 2,
}

registerEnumType(OrderControlTypesEnum, {
  name: "OrderControlTypesEnum",
  description: "Поля сортировки справочника типов контроля.",
  valuesMap: {
    nm: {
      description: "Наименование.",
    },
    controller: {
      description: "Ответственный контролер.",
    },
  },
});

/** Поля сортировки описи */
export enum OrderInventoryEnum {
  /** № */
  id = 1,
  /** № описи */
  number = 2,
  /** Наименование */
  inventory_name_id = 3,
  /** Год */
  inventory_year = 4,
  /** Описание */
  description = 5,
  /** Количество дел */
  count_doc_package = 6,
  /** Статус */
  status_id = 7,
}

registerEnumType(OrderInventoryEnum, {
  name: "OrderInventoryEnum",
  description: "Поля сортировки описи.",
  valuesMap: {
    id: {
      description: "Id описи.",
    },
    number: {
      description: "№ описи.",
    },
    inventory_name_id: {
      description: "Наименование.",
    },
    inventory_year: {
      description: "Год.",
    },
    description: {
      description: "Описание.",
    },
    count_doc_package: {
      description: "Количество дел.",
    },
    status_id: {
      description: "Статус.",
    },
  },
});

/** Поля сортировки акта */
export enum OrderActEnum {
  /** № */
  id = 1,
  /** № акта */
  number = 2,
  /** Дата создания */
  dtc = 3,
  /** Основание */
  basis = 4,
  /** Количество дел */
  count_doc_package = 5,
  /** Количество документов */
  count_doc = 6,
  /** Количество файлов */
  count_file = 7,
  /** Статус */
  status_id = 8,
}

registerEnumType(OrderActEnum, {
  name: "OrderActEnum",
  description: "Поля сортировки акта.",
  valuesMap: {
    id: {
      description: "Id акта.",
    },
    number: {
      description: "№ акта.",
    },
    dtc: {
      description: "Дата создания.",
    },
    basis: {
      description: "Основание.",
    },
    count_doc_package: {
      description: "Количество дел.",
    },
    count_doc: {
      description: "Количество документов.",
    },
    count_file: {
      description: "Количество файлов.",
    },
    status_id: {
      description: "Статус.",
    },
  },
});

/** Поля сортировки почтового импорта */
export enum OrderIncmailsEnum {
  /** № */
  id = 1,
  /** От */
  sender = 2,
  /** Тема */
  subject = 3,
  /** Дата */
  dt = 4,
}

registerEnumType(OrderIncmailsEnum, {
  name: "OrderIncmailsEnum",
  description: "Поля сортировки почтового импорта.",
  valuesMap: {
    id: {
      description: "№.",
    },
    sender: {
      description: "От.",
    },
    subject: {
      description: "Тема.",
    },
    dt: {
      description: "Дата.",
    },
  },
});

/** Поля сортировки списка сессий */
export enum OrderUserSessionEnum {
  /** Пользователь: id */
  user_id = 1,
  /** Тип сессии */
  type_session = 2,
  /** Сессионный токен */
  refresh_token = 3,
  /** Дата создания сессии */
  date_create = 4,
  /** Дата последней активности */
  date_activity = 5,
  /** Дата завершения сессии */
  date_expiration = 6,
  // /** Примечание */
  // note = 7,
}

registerEnumType(OrderUserSessionEnum, {
  name: "OrderUserSessionEnum",
  description: 'Поля сортировки списка сессий',
  valuesMap: {
    user_id: {
      description: "Пользователь: id",
    },
    type_session: {
      description: "Тип сессии",
    },
    refresh_token: {
      description: "Сессионный токен",
    },
    date_create: {
      description: "Дата создания сессии",
    },
    date_activity: {
      description: "Дата последней активности",
    },
    date_expiration: {
      description: "Дата завершения сессии",
    },
    // note: {
    //   description: "Примечание",
    // },
  },
});


/** Статусы описи */
export enum InventoryStatus {
  /** Новая */
  NEW = 1,
  /** В работе */
  IN_PROGRESS = 2,
  /** Подписана */
  SIGNED = 3,
  /** Отправлена */
  SENT = 4,
  /** Ошибка */
  ERROR = 5,
  /** Принята */
  ACCEPTED = 6,
}

/** Статусы дел */
export enum DocPackageStatus {
  /** Новое */
  NEW = 1,
  /** Сформирована внутренняя опись */
  INNER_INVENTORY_FORMED = 2,
  /** Внутренняя опись подписана */
  INNER_INVENTORY_SIGN = 3,
  /** В описи */
  INCLUDED_IN_INVENTORY = 4,
  /** В акте */
  INCLUDED_IN_ACT = 5,
}

/** Признак хранения дел, включенных в приемо-сдаточную опись */
export enum StoreAttribute {
  /** постоянное хранение */
  PERMANENT = 'PERMANENT',
  /** временное хранение (> 10 лет) */
  TEMPORARY = 'TEMPORARY',
  /** временное хранение (≤ 10 лет) */
  END_OF_NEED = 'END_OF_NEED',
  /** по личному составу */
  BY_STAFF = 'BY_STAFF',
}

/** Статусы актов. */
export enum ActStatus {
  /** Новый */
  NEW = 1,
  /** Подписан */
  SIGN = 2,
  /** Дела удалены */
  DOC_PACKAGE_DELETED = 3,
}

/** Статусы проектов. */
export enum DocProject {
  /** Новое */
  NEW = 1,
  /** В работе */
  IN_PROCESS = 2,
  /** На доработке */
  REVISION = 3,
  /** Завершен */
  COMPLETED = 4,
  /** Закрыт */
  CLOSED = 5,
}

/** Наименование описи */
export enum InventoryName {
  /** Постоянного хранения */
  PH = 1,
  /** Постоянного хранения управленческой документации */
  UD = 2,
  /** Постоянного хранения по личному составу */
  LS = 3,
  /** Постоянного хранения проектной документации */
  PD = 4,
  /** Постоянного хранения конструкторской документации */
  KD = 5,
  /** Постоянного хранения технологической документации */
  TD = 6,
  /** Постоянного хранения научно-исследовательской документации */
  NIR = 7,
  /** Постоянного хранения патентной документации */
  PATD = 8,
  /** Постоянного хранения опытно-конструкторских работ */
  OKR = 9,
  /** Постоянного хранения научно-исследовательских, опытно-конструкторских работ */
  NIOK = 10,
  /** Временного (свыше 10 лет) хранения */
  TEMPORARY = 11,
  /** Временного (до 10 лет включительно) хранения */
  END_OF_NEED = 12,
  /** Временного (до 10 лет включительно) хранения */
  BY_STAFF = 13,
}

/** Поля сортировки справочника "класс документа" */
export enum OrderCdocEnum {
  /** № */
  id = 1,
  /** Код класса документа */
  code = 2,
  /** Наименование класса документа */
  nm = 3,
}

registerEnumType(OrderCdocEnum, {
  name: "OrderCdocEnum",
  description: 'Поля сортировки справочника "класс документа"',
  valuesMap: {
    id: {
      description: "№",
    },
    code: {
      description: "Код класса документа",
    },
    nm: {
      description: "Наименование класса документа",
    },
  },
});
