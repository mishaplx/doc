import { PickType } from "@nestjs/graphql";
import { TdocEntity } from "../../../../../entity/#organization/doc/tdoc.entity";

class TdocSeed extends PickType(TdocEntity, [
  "id",
  "nm",
  "del",
  "temp",
  "can_be_edited",
  "code",
] as const) {}

export const tdocArr: TdocSeed[] = [
  {
    nm: "Входящее письмо (запрос)",
    del: false,
    temp: false,
    id: 1,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Постановление",
    del: false,
    temp: false,
    id: 2,
    can_be_edited: false,
    code: "605",
  },
  {
    nm: "Протокол",
    del: false,
    temp: false,
    id: 3,
    can_be_edited: false,
    code: "630",
  },
  {
    nm: "Указ",
    del: false,
    temp: false,
    id: 4,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Приказ",
    del: false,
    temp: false,
    id: 5,
    can_be_edited: false,
    code: "620",
  },
  {
    nm: "Решение",
    del: false,
    temp: false,
    id: 6,
    can_be_edited: false,
    code: "725",
  },
  {
    nm: "Поручение",
    del: false,
    temp: false,
    id: 7,
    can_be_edited: false,
    code: "600",
  },
  {
    nm: "Сопроводительное письмо",
    del: false,
    temp: false,
    id: 8,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Обращение",
    del: false,
    temp: false,
    id: 9,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Ответ",
    del: false,
    temp: false,
    id: 10,
    can_be_edited: false,
    code: "545",
  },
  {
    nm: "Ответ на обращение",
    del: false,
    temp: false,
    id: 11,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Запрос",
    del: false,
    temp: false,
    id: 12,
    can_be_edited: false,
    code: "240",
  },
  {
    nm: "Докладные записки по основной деятельности",
    del: false,
    temp: false,
    id: 13,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Приказы по основной деятельности",
    del: false,
    temp: false,
    id: 14,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Поручения директора по основной деятельности",
    del: false,
    temp: false,
    id: 15,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Протокол по основной деятельности",
    del: false,
    temp: false,
    id: 16,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Докладные записки по личному составу",
    del: false,
    temp: false,
    id: 17,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Заявление работника по личному составу",
    del: false,
    temp: false,
    id: 18,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Приказы по лиичному составу",
    del: false,
    temp: false,
    id: 19,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Приказы по кадрам",
    del: false,
    temp: false,
    id: 20,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Административные процедуры/Заявление",
    del: false,
    temp: false,
    id: 21,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Административные процедуры/Справка",
    del: false,
    temp: false,
    id: 22,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Договор",
    del: false,
    temp: false,
    id: 23,
    can_be_edited: false,
    code: "170",
  },
  {
    nm: "Жалоба",
    del: false,
    temp: false,
    id: 24,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Предложение",
    del: false,
    temp: false,
    id: 25,
    can_be_edited: false,
    code: "608",
  },
  {
    nm: "Благодарность",
    del: false,
    temp: false,
    id: 26,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Ответ на входящий",
    del: false,
    temp: false,
    id: 27,
    can_be_edited: false,
    code: null,
  },
  {
    nm: "Авизо",
    del: false,
    temp: false,
    id: 28,
    can_be_edited: false,
    code: "010",
  },
  {
    nm: "Служебная записка",
    del: false,
    temp: false,
    id: 29,
    can_be_edited: true,
    code: null,
  },
  {
    nm: "Аккредитив",
    del: false,
    temp: false,
    id: 30,
    can_be_edited: false,
    code: "020",
  },
  {
    nm: "Акт",
    del: false,
    temp: false,
    id: 31,
    can_be_edited: false,
    code: "030",
  },
  {
    nm: "Акция",
    del: false,
    temp: false,
    id: 32,
    can_be_edited: false,
    code: "040",
  },
  {
    nm: "Анкета",
    del: false,
    temp: false,
    id: 33,
    can_be_edited: false,
    code: "050",
  },
  {
    nm: "Аттестат",
    del: false,
    temp: false,
    id: 34,
    can_be_edited: false,
    code: "060",
  },
  {
    nm: "Баланс",
    del: false,
    temp: false,
    id: 35,
    can_be_edited: false,
    code: "070",
  },
  {
    nm: "Билет",
    del: false,
    temp: false,
    id: 36,
    can_be_edited: false,
    code: "080",
  },
  {
    nm: "Ведомость",
    del: false,
    temp: false,
    id: 37,
    can_be_edited: false,
    code: "090",
  },
  {
    nm: "Вексель",
    del: false,
    temp: false,
    id: 38,
    can_be_edited: false,
    code: "100",
  },
  {
    nm: "Вопросник",
    del: false,
    temp: false,
    id: 39,
    can_be_edited: false,
    code: "105",
  },
  {
    nm: "Выписка",
    del: false,
    temp: false,
    id: 40,
    can_be_edited: false,
    code: "110",
  },
  {
    nm: "Гарантия",
    del: false,
    temp: false,
    id: 41,
    can_be_edited: false,
    code: "120",
  },
  {
    nm: "График",
    del: false,
    temp: false,
    id: 42,
    can_be_edited: false,
    code: "130",
  },
  {
    nm: "Декларация",
    del: false,
    temp: false,
    id: 43,
    can_be_edited: false,
    code: "150",
  },
  {
    nm: "Дневник",
    del: false,
    temp: false,
    id: 44,
    can_be_edited: false,
    code: "155",
  },
  {
    nm: "Доверенность",
    del: false,
    temp: false,
    id: 45,
    can_be_edited: false,
    code: "160",
  },
  {
    nm: "Донесение",
    del: false,
    temp: false,
    id: 46,
    can_be_edited: false,
    code: "180",
  },
  {
    nm: "Дополнение",
    del: false,
    temp: false,
    id: 47,
    can_be_edited: false,
    code: "185",
  },
  {
    nm: "Журнал",
    del: false,
    temp: false,
    id: 48,
    can_be_edited: false,
    code: "190",
  },
  {
    nm: "Задание",
    del: false,
    temp: false,
    id: 49,
    can_be_edited: false,
    code: "210",
  },
  {
    nm: "Заказ",
    del: false,
    temp: false,
    id: 50,
    can_be_edited: false,
    code: "220",
  },
  {
    nm: "Закладная",
    del: false,
    temp: false,
    id: 51,
    can_be_edited: false,
    code: "224",
  },
  {
    nm: "Заключение",
    del: false,
    temp: false,
    id: 52,
    can_be_edited: false,
    code: "225",
  },
  {
    nm: "Записка",
    del: false,
    temp: false,
    id: 53,
    can_be_edited: false,
    code: "230",
  },
  {
    nm: "Заявка",
    del: false,
    temp: false,
    id: 54,
    can_be_edited: false,
    code: "250",
  },
  {
    nm: "Заявление",
    del: false,
    temp: false,
    id: 55,
    can_be_edited: false,
    code: "260",
  },
  {
    nm: "Извещение",
    del: false,
    temp: false,
    id: 56,
    can_be_edited: false,
    code: "280",
  },
  {
    nm: "Изменение",
    del: false,
    temp: false,
    id: 57,
    can_be_edited: false,
    code: "290",
  },
  {
    nm: "Инструкция",
    del: false,
    temp: false,
    id: 58,
    can_be_edited: false,
    code: "300",
  },
  {
    nm: "Калькуляция",
    del: false,
    temp: false,
    id: 59,
    can_be_edited: false,
    code: "340",
  },
  {
    nm: "Карнет",
    del: false,
    temp: false,
    id: 60,
    can_be_edited: false,
    code: "345",
  },
  {
    nm: "Карта",
    del: false,
    temp: false,
    id: 61,
    can_be_edited: false,
    code: "350",
  },
  {
    nm: "Карточка",
    del: false,
    temp: false,
    id: 62,
    can_be_edited: false,
    code: "360",
  },
  {
    nm: "Квитанция",
    del: false,
    temp: false,
    id: 63,
    can_be_edited: false,
    code: "370",
  },
  {
    nm: "Книга",
    del: false,
    temp: false,
    id: 64,
    can_be_edited: false,
    code: "375",
  },
  {
    nm: "Книжка",
    del: false,
    temp: false,
    id: 65,
    can_be_edited: false,
    code: "380",
  },
  {
    nm: "Коносамент",
    del: false,
    temp: false,
    id: 66,
    can_be_edited: false,
    code: "390",
  },
  {
    nm: "Контракт",
    del: false,
    temp: false,
    id: 67,
    can_be_edited: false,
    code: "400",
  },
  {
    nm: "Лист",
    del: false,
    temp: false,
    id: 68,
    can_be_edited: false,
    code: "410",
  },
  {
    nm: "Листок",
    del: false,
    temp: false,
    id: 69,
    can_be_edited: false,
    code: "415",
  },
  {
    nm: "Лицензия",
    del: false,
    temp: false,
    id: 70,
    can_be_edited: false,
    code: "420",
  },
  {
    nm: "Манифест",
    del: false,
    temp: false,
    id: 71,
    can_be_edited: false,
    code: "430",
  },
  {
    nm: "Меню",
    del: false,
    temp: false,
    id: 72,
    can_be_edited: false,
    code: "440",
  },
  {
    nm: "Накладная",
    del: false,
    temp: false,
    id: 73,
    can_be_edited: false,
    code: "460",
  },
  {
    nm: "Напоминание",
    del: false,
    temp: false,
    id: 74,
    can_be_edited: false,
    code: "464",
  },
  {
    nm: "Направление",
    del: false,
    temp: false,
    id: 75,
    can_be_edited: false,
    code: "465",
  },
  {
    nm: "Наряд",
    del: false,
    temp: false,
    id: 76,
    can_be_edited: false,
    code: "470",
  },
  {
    nm: "Нормы",
    del: false,
    temp: false,
    id: 77,
    can_be_edited: false,
    code: "475",
  },
  {
    nm: "Нормативы",
    del: false,
    temp: false,
    id: 78,
    can_be_edited: false,
    code: "480",
  },
  {
    nm: "Облигация",
    del: false,
    temp: false,
    id: 79,
    can_be_edited: false,
    code: "490",
  },
  {
    nm: "Обоснование",
    del: false,
    temp: false,
    id: 80,
    can_be_edited: false,
    code: "500",
  },
  {
    nm: "Объявление",
    del: false,
    temp: false,
    id: 81,
    can_be_edited: false,
    code: "510",
  },
  {
    nm: "Обязательство",
    del: false,
    temp: false,
    id: 82,
    can_be_edited: false,
    code: "520",
  },
  {
    nm: "Одобрение",
    del: false,
    temp: false,
    id: 83,
    can_be_edited: false,
    code: "522",
  },
  {
    nm: "Описание",
    del: false,
    temp: false,
    id: 84,
    can_be_edited: false,
    code: "525",
  },
  {
    nm: "Опись",
    del: false,
    temp: false,
    id: 85,
    can_be_edited: false,
    code: "530",
  },
  {
    nm: "Ордер",
    del: false,
    temp: false,
    id: 86,
    can_be_edited: false,
    code: "540",
  },
  {
    nm: "Отчет",
    del: false,
    temp: false,
    id: 87,
    can_be_edited: false,
    code: "550",
  },
  {
    nm: "Оферта",
    del: false,
    temp: false,
    id: 88,
    can_be_edited: false,
    code: "555",
  },
  {
    nm: "Памятка",
    del: false,
    temp: false,
    id: 89,
    can_be_edited: false,
    code: "560",
  },
  {
    nm: "Паспорт",
    del: false,
    temp: false,
    id: 90,
    can_be_edited: false,
    code: "570",
  },
  {
    nm: "Патент",
    del: false,
    temp: false,
    id: 91,
    can_be_edited: false,
    code: "575",
  },
  {
    nm: "Перечень",
    del: false,
    temp: false,
    id: 92,
    can_be_edited: false,
    code: "590",
  },
  {
    nm: "План",
    del: false,
    temp: false,
    id: 93,
    can_be_edited: false,
    code: "595",
  },
  {
    nm: "Подписка",
    del: false,
    temp: false,
    id: 94,
    can_be_edited: false,
    code: "596",
  },
  {
    nm: "Подтверждение",
    del: false,
    temp: false,
    id: 95,
    can_be_edited: false,
    code: "597",
  },
  {
    nm: "Показатели",
    del: false,
    temp: false,
    id: 96,
    can_be_edited: false,
    code: "598",
  },
  {
    nm: "Полис",
    del: false,
    temp: false,
    id: 97,
    can_be_edited: false,
    code: "599",
  },
  {
    nm: "Предписание",
    del: false,
    temp: false,
    id: 98,
    can_be_edited: false,
    code: "610",
  },
  {
    nm: "Представление",
    del: false,
    temp: false,
    id: 99,
    can_be_edited: false,
    code: "612",
  },
  {
    nm: "Предупреждение",
    del: false,
    temp: false,
    id: 100,
    can_be_edited: false,
    code: "615",
  },
  {
    nm: "Прейскурант",
    del: false,
    temp: false,
    id: 101,
    can_be_edited: false,
    code: "616",
  },
  {
    nm: "Приглашение",
    del: false,
    temp: false,
    id: 102,
    can_be_edited: false,
    code: "618",
  },
  {
    nm: "Прогноз",
    del: false,
    temp: false,
    id: 103,
    can_be_edited: false,
    code: "622",
  },
  {
    nm: "Программа",
    del: false,
    temp: false,
    id: 104,
    can_be_edited: false,
    code: "625",
  },
  {
    nm: "Пропуск",
    del: false,
    temp: false,
    id: 105,
    can_be_edited: false,
    code: "627",
  },
  {
    nm: "Просьба",
    del: false,
    temp: false,
    id: 106,
    can_be_edited: false,
    code: "628",
  },
  {
    nm: "Путевка",
    del: false,
    temp: false,
    id: 107,
    can_be_edited: false,
    code: "640",
  },
  {
    nm: "Разнарядка",
    del: false,
    temp: false,
    id: 108,
    can_be_edited: false,
    code: "650",
  },
  {
    nm: "Разрешение",
    del: false,
    temp: false,
    id: 109,
    can_be_edited: false,
    code: "660",
  },
  {
    nm: "Рапорт",
    del: false,
    temp: false,
    id: 110,
    can_be_edited: false,
    code: "665",
  },
  {
    nm: "Расписание",
    del: false,
    temp: false,
    id: 111,
    can_be_edited: false,
    code: "670",
  },
  {
    nm: "Расписка",
    del: false,
    temp: false,
    id: 112,
    can_be_edited: false,
    code: "672",
  },
  {
    nm: "Распоряжение",
    del: false,
    temp: false,
    id: 113,
    can_be_edited: false,
    code: "680",
  },
  {
    nm: "Распределение",
    del: false,
    temp: false,
    id: 114,
    can_be_edited: false,
    code: "685",
  },
  {
    nm: "Расчет",
    del: false,
    temp: false,
    id: 115,
    can_be_edited: false,
    code: "690",
  },
  {
    nm: "Расшифровка",
    del: false,
    temp: false,
    id: 116,
    can_be_edited: false,
    code: "700",
  },
  {
    nm: "Регламент",
    del: false,
    temp: false,
    id: 117,
    can_be_edited: false,
    code: "705",
  },
  {
    nm: "Реестр",
    del: false,
    temp: false,
    id: 118,
    can_be_edited: false,
    code: "710",
  },
  {
    nm: "Рекламация",
    del: false,
    temp: false,
    id: 119,
    can_be_edited: false,
    code: "720",
  },
  {
    nm: "Рекомендация",
    del: false,
    temp: false,
    id: 120,
    can_be_edited: false,
    code: "722",
  },
  {
    nm: "Роспись",
    del: false,
    temp: false,
    id: 121,
    can_be_edited: false,
    code: "730",
  },
  {
    nm: "Сведения",
    del: false,
    temp: false,
    id: 122,
    can_be_edited: false,
    code: "740",
  },
  {
    nm: "Свидетельство",
    del: false,
    temp: false,
    id: 123,
    can_be_edited: false,
    code: "750",
  },
  {
    nm: "Сводка",
    del: false,
    temp: false,
    id: 124,
    can_be_edited: false,
    code: "760",
  },
  {
    nm: "Сертификат",
    del: false,
    temp: false,
    id: 125,
    can_be_edited: false,
    code: "770",
  },
  {
    nm: "Смета",
    del: false,
    temp: false,
    id: 126,
    can_be_edited: false,
    code: "780",
  },
  {
    nm: "Согласие",
    del: false,
    temp: false,
    id: 127,
    can_be_edited: false,
    code: "785",
  },
  {
    nm: "Соглашение",
    del: false,
    temp: false,
    id: 128,
    can_be_edited: false,
    code: "790",
  },
  {
    nm: "Сообщение",
    del: false,
    temp: false,
    id: 129,
    can_be_edited: false,
    code: "795",
  },
  {
    nm: "Состав",
    del: false,
    temp: false,
    id: 130,
    can_be_edited: false,
    code: "800",
  },
  {
    nm: "Спецификация",
    del: false,
    temp: false,
    id: 131,
    can_be_edited: false,
    code: "810",
  },
  {
    nm: "Список",
    del: false,
    temp: false,
    id: 132,
    can_be_edited: false,
    code: "820",
  },
  {
    nm: "Справка",
    del: false,
    temp: false,
    id: 133,
    can_be_edited: false,
    code: "830",
  },
  {
    nm: "Стратегия",
    del: false,
    temp: false,
    id: 134,
    can_be_edited: false,
    code: "835",
  },
  {
    nm: "Структура",
    del: false,
    temp: false,
    id: 135,
    can_be_edited: false,
    code: "840",
  },
  {
    nm: "Счет",
    del: false,
    temp: false,
    id: 136,
    can_be_edited: false,
    code: "850",
  },
  {
    nm: "Схема",
    del: false,
    temp: false,
    id: 137,
    can_be_edited: false,
    code: "860",
  },
  {
    nm: "Табель",
    del: false,
    temp: false,
    id: 138,
    can_be_edited: false,
    code: "870",
  },
  {
    nm: "Таблица",
    del: false,
    temp: false,
    id: 139,
    can_be_edited: false,
    code: "880",
  },
  {
    nm: "Талон",
    del: false,
    temp: false,
    id: 140,
    can_be_edited: false,
    code: "885",
  },
  {
    nm: "Требование",
    del: false,
    temp: false,
    id: 141,
    can_be_edited: false,
    code: "890",
  },
  {nm: "Уведомление",
    del: false,
    temp: false,
    id: 142,
    can_be_edited: false,
    code: "910",
  },
  {
    nm: "Удостоверение",
    del: false,
    temp: false,
    id: 143,
    can_be_edited: false,
    code: "920",
  },
  {
    nm: "Указание",
    del: false,
    temp: false,
    id: 144,
    can_be_edited: false,
    code: "925",
  },
  {
    nm: "Устав",
    del: false,
    temp: false,
    id: 145,
    can_be_edited: false,
    code: "930",
  },
  {
    nm: "Формуляр",
    del: false,
    temp: false,
    id: 146,
    can_be_edited: false,
    code: "935",
  },
  {
    nm: "Характеристика",
    del: false,
    temp: false,
    id: 147,
    can_be_edited: false,
    code: "940",
  },
  {
    nm: "Ходатайство",
    del: false,
    temp: false,
    id: 148,
    can_be_edited: false,
    code: "950",
  },
  {
    nm: "Чек",
    del: false,
    temp: false,
    id: 149,
    can_be_edited: false,
    code: "960",
  },
  {
    nm: "Этикетка",
    del: false,
    temp: false,
    id: 150,
    can_be_edited: false,
    code: "970",
  },
  {
    nm: "Ярлык",
    del: false,
    temp: false,
    id: 151,
    can_be_edited: false,
    code: "980",
  },
];
