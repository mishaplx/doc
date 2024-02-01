import { customError } from "../../../common/type/errorHelper.type";
import { ACTION_OBJECTS, TYPE_ACTION_OBJECTS_KEYS_OUT } from "../const/actions";

/**
 * ШАГ 1 - ПОИСК ИМЕНОВАННЫХ АРГУМЕНТОВ
 * ГЛАВНЫЙ ОБЪЕКТ НЕ ИМЕЕТ ЗНАЧЕНИЯ
 * СМОТРИМ ИСКЛЮЧИТЕЛЬНО НА НАЗВАНИЕ АРГУМЕНТА
 * РЕКУРСИЯ ПОИСКА ЕСТЬ
 * ПОВТОРНЫЕ ОБЪЯВЛЕНИЯ НЕ ДОПУСТИМЫ
 * например:
 * - { input: { job_id: 1 }} => { job: [1] }
 * - { jobId: [2, 3] } => { job: [2, 3] }
 */
export const accessGuardParserArgsStep1 = (args_in: unknown): TYPE_ACTION_OBJECTS_KEYS_OUT => {
  // рекурсивный поиск аргументов
  const fnScan = (args: unknown): void => {
    // аргумент является объектом
    if (args === Object(args)) {
      // просмотреть все ключи аргумента
      for (const arg of Object.keys(args)) {
        const arg_lower = arg.toLowerCase();
        let isNextArg = false;

        // искать в ключах аргумента идентификаторы для каждого типа объектов
        for (const action_object of ACTION_OBJECTS) {
          const args_in_lowercase = action_object.keys_in.map((x) => x.toLowerCase());
          // идентификатор объекта найден - запомнить
          if (args_in_lowercase.includes(arg_lower)) {
            // идентификатор объекта был найден ранее - ошибка
            if (ret[action_object.key_out])
              customError("Невозможно однозначно определить " + action_object.key_out);
            // запомнить идентификатор объекта
            ret[action_object.key_out] = Array.isArray(args[arg]) ? args[arg] : [args[arg]];
            // следующий ключ аргумента
            isNextArg = true;
            break;
          }
        }

        if (isNextArg) continue;
        // идентификатор объекта не найден - рекурсивный поиск
        fnScan(args[arg]);
      }
    }
  };

  const ret: TYPE_ACTION_OBJECTS_KEYS_OUT = {};
  fnScan(args_in);
  return ret;
};
