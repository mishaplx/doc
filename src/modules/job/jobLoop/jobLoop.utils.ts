import dayjs from "dayjs";
import localeRu from "dayjs/locale/ru";
import isoWeek from "dayjs/plugin/isoWeek";

import { JobLoopKindEnum, JobLoopMonthEnum } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { customError } from "../../../common/type/errorHelper.type";
import {
  getWeekOfMonth,
  getWeekSeq,
  isLastDayOfMonth,
  isLastWeekOfMonth,
  setDateOfMonth,
} from "../../../common/utils/utils.date";
import { getNoun } from "../../../common/utils/utils.text";
import { JobLoopEntity } from "../../../entity/#organization/job/jobLoop.entity";
import { JOB } from "../job.const";
import { GetMonthVariantsResponse } from "./jobLoop.dto";

dayjs.extend(isoWeek);

/**
 * Список плановых дат для периодичности
 */
export const getJobLoopDates = async (jobLoopEntity: JobLoopEntity): Promise<Date[]> => {
  const ret: Date[] = [];
  let iLoop = 0;
  const start_dt = dayjs(jobLoopEntity.start_date);
  let item_next_dt = start_dt?.clone();
  const end_dt = jobLoopEntity.end_date ? dayjs(jobLoopEntity.end_date) : undefined;
  const end_count = Math.min(jobLoopEntity.end_count ?? JOB.LOOP_MAX, JOB.LOOP_MAX);
  if (!end_count && !end_dt) {
    customError("На задано условие завершения периодичности");
  }

  // проверка допустимости и добавление очередной даты серии
  const nextStep = (): boolean => {
    iLoop++;
    const ret_local = (!end_count || iLoop <= end_count) && (!end_dt || item_next_dt <= end_dt);
    if (ret_local) {
      // ret.push(((item_next_dt) ? item_next_dt : start_dt).toDate());
      ret.push(item_next_dt.toDate());
    }
    return ret_local;
  };

  // последовательности дней недели до и после стартовой даты
  const week_seq_orig = getJobLoopWeekSeq(jobLoopEntity);
  const week_seq = getWeekSeq(start_dt, week_seq_orig);

  // для начальной даты: номер недели с начала месяца
  const month_week_start = getWeekOfMonth(start_dt);
  // для начальной даты: день недели - вск = 0
  const month_day_start = start_dt.day();

  let bLoop = true;
  do {
    const item_start_dt = item_next_dt?.clone();
    //item_next_dt = undefined;

    switch (jobLoopEntity.loop_kind) {
      // ПОВТОР: ДЕНЬ
      case JobLoopKindEnum.day:
        bLoop = nextStep();
        item_next_dt = item_start_dt.add(jobLoopEntity.loop_interval, "day") as dayjs.Dayjs;
        break;

      // ПОВТОР: НЕДЕЛЯ
      case JobLoopKindEnum.week:
        for (const week_seq_item of week_seq) {
          // последовательность дней недели относительно стартовой даты
          item_next_dt = item_start_dt.day(week_seq_item);
          bLoop = nextStep();
          if (!bLoop) break;
        }
        item_next_dt = item_start_dt.add(jobLoopEntity.loop_interval, "week") as dayjs.Dayjs;
        break;

      // ПОВТОР: МЕСЯЦ
      case JobLoopKindEnum.month:
        switch (jobLoopEntity.loop_month_type) {
          case JobLoopMonthEnum.day_n:
            item_next_dt = item_start_dt.date(start_dt.date());
            // регистрировать только дату текущего месяца
            if (item_start_dt.month() == item_next_dt.month()) {
              bLoop = nextStep();
            }
            break;

          case JobLoopMonthEnum.day_last:
            item_next_dt = setDateOfMonth({
              dt: item_start_dt,
              day: -1,
            });
            bLoop = nextStep();
            break;

          case JobLoopMonthEnum.week_n:
            item_next_dt = setDateOfMonth({
              dt: item_start_dt,
              week: month_week_start,
              day: month_day_start,
            });
            bLoop = nextStep();
            break;

          case JobLoopMonthEnum.week_last:
            item_next_dt = setDateOfMonth({
              dt: item_start_dt,
              week: -1,
              day: month_day_start,
            });
            bLoop = nextStep();
            break;

          default:
            customError("Ошибка периодичности месяца");
        }
        item_next_dt = item_start_dt.add(jobLoopEntity.loop_interval, "month") as dayjs.Dayjs;
        break;

      // ПОВТОР: ГОД
      case JobLoopKindEnum.year:
        bLoop = nextStep();
        item_next_dt = item_start_dt.add(jobLoopEntity.loop_interval, "year") as dayjs.Dayjs;
        break;

      // ПОВТОР: ОШИБКА
      default:
        customError("Ошибка типа повтора");
    }
  } while (bLoop);

  return ret;
};

/**
 * Список вариантов выбора для заданной даты
 */
export const getJobLoopMonthVariantsUtil = async (
  start_date: Date,
): Promise<GetMonthVariantsResponse[]> => {
  const ret: GetMonthVariantsResponse[] = [];
  try {
    const dt = dayjs(start_date).locale(localeRu);
    const weekOfMonth = getWeekOfMonth(start_date);

    ret.push({
      key: JobLoopMonthEnum.day_n,
      title: dt.format("DD числа"),
    });
    if (isLastDayOfMonth(start_date)) {
      ret.push({
        key: JobLoopMonthEnum.day_last,
        title: "последний день месяца",
      });
    }
    if (weekOfMonth < 5) {
      ret.push({
        key: JobLoopMonthEnum.week_n,
        title: dt.format("dddd ") + weekOfMonth + "-й недели",
      });
    }
    if (isLastWeekOfMonth(start_date)) {
      ret.push({
        key: JobLoopMonthEnum.week_last,
        title: dt.format("dddd ") + "последней недели",
      });
    }
  } catch (err) {
    ret.splice(0, ret.length);
  }
  return ret;
};

/**
 * Строковое представление периодичности
 */
export const getJobLoopTitle = async (jobLoopEntity: JobLoopEntity): Promise<string> => {
  let ret = "";
  try {
    ret = "с " + dayjs(jobLoopEntity.start_date).locale(localeRu).format("DD.MM.YYYY") + ", ";
    const interval_str = jobLoopEntity.loop_interval > 1 ? jobLoopEntity.loop_interval + " " : "";
    switch (jobLoopEntity.loop_kind) {
      // ПОВТОР: ДЕНЬ
      case JobLoopKindEnum.day:
        ret += "каждый " + interval_str + "день";
        break;

      // ПОВТОР: НЕДЕЛЯ
      case JobLoopKindEnum.week:
        // последовательности дней недели до и после стартовой даты
        const week_num = getJobLoopWeekSeq(jobLoopEntity);
        const week_str = week_num.map((x) => dayjs().locale(localeRu).isoWeekday(x).format("dddd"));
        ret += week_str.join(", ") + ", каждую " + interval_str + "неделю";
        break;

      // ПОВТОР: МЕСЯЦ
      case JobLoopKindEnum.month:
        const month_variants = await getJobLoopMonthVariantsUtil(jobLoopEntity.start_date);
        ret +=
          (month_variants.filter((x) => x.key == jobLoopEntity.loop_month_type)?.at(0)?.title ??
            "") +
          ", каждый " +
          interval_str +
          "месяц";
        break;

      // ПОВТОР: ГОД
      case JobLoopKindEnum.year:
        ret += "каждый " + interval_str + "год";
    }
    ret += ",";

    if (jobLoopEntity.end_count) {
      ret +=
        " " +
        jobLoopEntity.end_count +
        " " +
        getNoun({
          count: jobLoopEntity.end_count,
          one: "раз",
          two: "раза",
          five: "раз",
        });
    }

    if (jobLoopEntity.end_date) {
      ret += " до " + dayjs(jobLoopEntity.end_date).locale(localeRu).format("DD.MM.YYYY");
    }
  } catch (err) {}
  return ret;
};

/**
 * Список индексов дней недели (отсортированный)
 */
const getJobLoopWeekSeq = (jobLoopEntity: JobLoopEntity): number[] => {
  const week_seq: number[] = [];
  for (let i = 1; i < 8; i++) {
    if (jobLoopEntity["loop_week_" + i]) week_seq.push(i);
  }
  return week_seq.sort((a, b) => a - b);
};
