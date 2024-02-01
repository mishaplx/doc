import dayjs from "dayjs";
// import localeRu from "dayjs/locale/ru";

import duration from "dayjs/plugin/duration";
import weekOfYear from "dayjs/plugin/weekOfYear";

import { customError } from "../type/errorHelper.type";

dayjs.extend(duration);
dayjs.extend(weekOfYear);

/**
 * ПРИЗНАК: ПОСЛЕДНЯЯ НЕДЕЛЯ МЕСЯЦА
 */
export const isLastWeekOfMonth = (dt: string | number | dayjs.Dayjs | Date): boolean => {
  const dt_now = dayjs(dt);
  const dt_last = dayjs(dt).endOf("month"); // последняя секунда месяца
  const duration = dayjs.duration(dt_last.diff(dt_now)).as("days");
  return duration < 7;
};

/**
 * ПРИЗНАК: ПОСЛЕДНИЙ ДЕНЬ МЕСЯЦА
 */
export const isLastDayOfMonth = (dt: string | number | dayjs.Dayjs | Date): boolean => {
  const dt_now = dayjs(dt);
  const dt_last = dayjs(dt).endOf("month"); // последняя секунда месяца
  const duration = dayjs.duration(dt_last.diff(dt_now)).as("days");
  return duration < 1;
};

/**
 * НОМЕР НЕДЕЛИ В МЕСЯЦЕ (с 1)
 */
export const getWeekOfMonth = (dt: string | number | dayjs.Dayjs | Date): number => {
  const dt_now = dayjs(dt);
  const dt_first = dayjs(dt).startOf("month"); // первая секунда месяца
  const duration = dayjs.duration(dt_now.diff(dt_first)).as("week");
  return Math.floor(duration) + 1;
};

/**
 * УСТАНОВИТЬ ДЕНЬ В МЕСЯЦЕ
 * @param(week) - номер недели в месяце, с 1 (-1 - последняя неделя месяца)
 * @param(day) - номер дня недели (0 - вск) (-1 - последний день месяца)
 */
export const setDateOfMonth = (args: {
  dt: string | number | dayjs.Dayjs | Date;
  week?: number;
  day?: number;
}): dayjs.Dayjs => {
  const { dt, week, day } = args;
  const dt_start = dayjs(dt);
  let ret = dt_start.clone();
  if (week == -1 && day == -1) customError("Недопустимое сочетание аргументов");

  const corrDt = (dt_tmp: dayjs.Dayjs): dayjs.Dayjs => {
    if (dt_start.month() > dt_tmp.month()) return dt_tmp.add(7, "day");
    if (dt_start.month() < dt_tmp.month()) return dt_tmp.add(-7, "day");
    return dt_tmp;
  };

  // исключение: последний день в месяце
  if (day == -1) {
    ret = ret.date(ret.daysInMonth());
  }

  // исключение: последняя неделя в месяце
  if (week == -1) {
    let week_tmp = 1;
    do {
      const ret_tmp = ret.week(dt_start.week() + week_tmp);
      // месяц не изменился
      if (ret.month() == ret_tmp.month()) {
        week_tmp++;
        // месяц изменился - минус неделя, стоп
      } else {
        ret = ret_tmp.add(-7, "day");
        break;
      }
    } while (true);
  }

  // установить день недели (0 -> вск., 1 -> пнд., ...)
  if (day >= 0) {
    ret = ret.day(day);
    ret = corrDt(ret);
  }

  // установить неделю в месяце (c 1)
  if (week >= 1) {
    ret = ret.week(dt_start.week() + week - getWeekOfMonth(ret));
    ret = corrDt(ret);
  }

  return ret;
};

/**
 * ПОСЛЕДОВАТЕЛЬНОСТЬ ДНЕЙ НЕДЕЛИ: СО ДНЯ НЕДЕЛИ СТАРТОВОЙ ДАТЫ И ДО СТАРТОВОЙ ДАТЫ + 7
 * dt четверг, seq [4,3,5,1] => [4,5,8(1+7),10(3+7)]
 * +7 для перехода на следующую неделю
 */
export const getWeekSeq = (dt: string | number | dayjs.Dayjs | Date, seq: number[]): number[] => {
  const week_ind = dayjs(dt).day(); // 1 - пнд
  const tmp = [...seq].sort((a, b) => a - b);
  return [
    ...tmp.filter((x) => x >= week_ind),
    ...tmp.filter((x) => x < week_ind).map((x) => x + 7),
  ];
};
