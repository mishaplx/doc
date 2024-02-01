/**
 * СКЛОНЕНИЕ СУЩЕСТВИТЕЛЬНОГО
 * один товар, два товара, пять товаров
 */
export const getNoun = (args: {
  count: number;
  one: string;
  two: string;
  five: string;
}): string => {
  const val = Math.abs(args.count) % 100;
  const num = val % 10;
  if (val > 10 && val < 20) return args.five;
  if (num > 1 && num < 5) return args.two;
  if (num == 1) return args.one;
  return args.five;
};

/**
 * является ли хоть один символ кириллицей
 */
// export const isAscii = (s: string): boolean => {
//   return /[а-яА-ЯЁё]+/.test(s);
// }

/**
 * УСТАНОВИТЬ ПЕРВЫЙ СИМВОЛ ЗАГЛАВНЫМ
 */
export const toUpFirst = ({
  str,
  prefix = '',
  postfix = '',
}: {
  str: string;
  prefix?: string;
  postfix?: string;
}): string =>
  (str != undefined && str.length > 0)
    ? ( prefix + str.at(0)?.toUpperCase() + str.slice(1) + postfix )
    : '';

/**
 * ОСТАВИТЬ ТОЛЬКО ПЕРВЫЙ СИМВОЛ И СДЕЛАТЬ ЗАГЛАВНЫМ
 */
export const onlyUpFirst = ({
  str,
  prefix = '',
  postfix = '',
}: {
  str: string;
  prefix?: string;
  postfix?: string;
}): string =>
  (str != undefined && str.length > 0)
    ? ( prefix + str.at(0)?.toUpperCase() + postfix )
    : '';
