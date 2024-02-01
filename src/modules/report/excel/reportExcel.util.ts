// import 'dotenv/config';

/********************************************
 * EXCEL: ОБОЗНАЧЕНИЕ СТРОКИ ИЗ СТРОКИ В ЧИСЛО
 * 'A'=>1, 'B'=>2, 'AB'=>28
 ********************************************/
export const xlsxColumnCharToNum = (val: string): number => {
  const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = 0;
  val = val.toUpperCase();
  for (let i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
    result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
  }
  return result;
};
