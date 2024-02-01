import { customError } from "../../../common/type/errorHelper.type";
import { ACTION_OBJECTS, TYPE_ACTION_OBJECTS_KEYS_OUT } from "../const/actions";

/**
 * ШАГ 2 - ПОИСК ИМЕНОВАННЫХ АРГУМЕНТОВ 'id', 'ids'
 * ГЛАВНЫЙ ОБЪЕКТ ЗАДАН
 * РЕКУРСИЯ ПОИСКА ЕСТЬ
 * ПОВТОРНЫЕ ОБЪЯВЛЕНИЯ НЕ ДОПУСТИМЫ
 * например:
 * - категория объекта: 'job'
 * - { input: { id: 1 }} => { job: [1] }
 * - { ids: [2, 3] } => { job: [2, 3] }
 */
export const accessGuardParserArgsStep2 = (
  args_in: unknown,
  action_objects_ind: number,
): TYPE_ACTION_OBJECTS_KEYS_OUT => {
  // рекурсивный поиск аргументов
  const fnScan = (args: unknown): void => {
    // аргумент является объектом
    if (args === Object(args)) {
      // просмотреть все ключи аргумента
      for (const arg of Object.keys(args)) {
        const arg_lower = arg.toLowerCase();

        // искать в ключах аргумента идентификаторы для заданного объекта
        const action_object = ACTION_OBJECTS[action_objects_ind];
        const args_in_lowercase = ["id", "ids"];
        // идентификатор объекта найден - запомнить
        if (args_in_lowercase.includes(arg_lower)) {
          // идентификатор объекта был найден ранее - ошибка
          if (ret[action_object.key_out])
            customError("Невозможно однозначно определить " + action_object.key_out);
          // запомнить идентификатор объекта
          ret[action_object.key_out] = Array.isArray(args[arg]) ? args[arg] : [args[arg]];
          // следующий ключ аргумента
          break;
        }

        // идентификатор объекта не найден - рекурсивный поиск
        fnScan(args[arg]);
      }
    }
  };

  const ret: TYPE_ACTION_OBJECTS_KEYS_OUT = {};
  fnScan(args_in);
  return ret;
};
