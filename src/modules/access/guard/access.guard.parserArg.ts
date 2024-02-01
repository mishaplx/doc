import { ACTION_OBJECTS, TYPE_ACTION_OBJECTS_KEYS_OUT } from "../const/actions";
import { accessGuardParserArgsStep1 } from "./access.guard.parserArg.step1";
import { accessGuardParserArgsStep2 } from "./access.guard.parserArg.step2";
import { accessGuardParserArgsStep3 } from "./access.guard.parserArg.step3";

/**
 * РАСПАРСИТЬ ВХОДЯЩИЕ АРГУМЕНТЫ (args_in) ВЫЗВАННОГО МЕТОДА
 * ПОЛУЧИТЬ ИДЕНТИФИКАТОРЫ ОБЪЕКТОВ
 * анализируются названия ключей объекта, в т.ч. вложенные, в т.ч DTO
 */
export const accessGuardParserArgs = (
  action_objects_ind: number,
  args_in: unknown,
): TYPE_ACTION_OBJECTS_KEYS_OUT => {
  const action_object = ACTION_OBJECTS[action_objects_ind];

  // ШАГ 1 - ПОИСК ИМЕНОВАННЫХ АРГУМЕНТОВ БЕЗ УЧЕТА ГЛАВНОГО ОБЪЕКТА
  const ret = accessGuardParserArgsStep1(args_in);
  if (Object.keys(ret).length > 0 && ret[action_object.key_out]?.length > 0) return ret;

  // // ШАГ 2 - ПОИСК ИМЕНОВАННЫХ АРГУМЕНТОВ С УЧЕТОМ ГЛАВНОГО ОБЪЕКТА
  // const ret2 = accessGuardParserArgsStep2(args_in, action_objects_ind);
  // if (
  //   (Object.keys(ret2).length > 0) &&
  //   (ret2[action_object.key_out]?.length > 0)
  // ) {
  //   ret[action_object.key_out] = ret2[action_object.key_out];
  //   return ret;
  // }

  // // ШАГ 3 - ПОИСК НЕИМЕНОВАННОГО ЕДИНСТВЕННОГО АРГУМЕНТА С УЧЕТОМ ГЛАВНОГО ОБЪЕКТА
  // const ret3 = accessGuardParserArgsStep3(args_in, action_objects_ind);
  // if (
  //   (Object.keys(ret3).length > 0) &&
  //   (ret3[action_object.key_out]?.length > 0)
  // ) {
  //   ret[action_object.key_out] = ret3[action_object.key_out];
  //   return ret;
  // }

  return {};
};
