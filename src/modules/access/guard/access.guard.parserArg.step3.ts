import { ACTION_OBJECTS, TYPE_ACTION_OBJECTS_KEYS_OUT } from "../const/actions";

/**
 * ШАГ 3 - ПОИСК НЕИМЕНОВАННОГО ЕДИНСТВЕННОГО АРГУМЕНТА
 * ЦЕЛЕВОЙ ОБЪЕКТ ЗАДАН
 * например:
 * - категория объекта: 'job'
 * - 1 => { job: [1] }
 * - [2, 3] => { job: [2, 3] }
 */
export const accessGuardParserArgsStep3 = (
  args_in: unknown,
  action_objects_ind: number,
): TYPE_ACTION_OBJECTS_KEYS_OUT => {
  const action_object = ACTION_OBJECTS[action_objects_ind];
  if (Number.isInteger(args_in)) {
    return {
      [action_object.key_out]: [args_in as number],
    };
  }

  if (Array.isArray(args_in)) {
    if ((args_in as any[]).every((item) => Number.isInteger(item))) {
      return {
        [action_object.key_out]: args_in as number[],
      };
    }
  }

  return {};
};
