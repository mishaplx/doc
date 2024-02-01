import { ACTION_OBJECTS } from "../const/actions";

/**
 * ОПРЕДЕЛИТЬ ИНДЕКС ОБЪЕКТА В ACTION_OBJECTS,
 * НЕДОПУСТИМО НЕСКОЛЬКО ACTIONS С РАЗНЫМИ ОБЪЕКТАМИ
 * @return - -1 - категория не определена
 */
export const getActionObjectsInd = (actions: string[]): number => {
  const VAL_WRONG = -1;
  let ret = VAL_WRONG;
  for (const action of actions) {
    for (let ind = 0; ind < ACTION_OBJECTS.length; ind++) {
      const obj = ACTION_OBJECTS[ind];
      // найти объект по списку actions
      if (Object.values(obj.actions).includes(action)) {
        // объект уже есть, объект отличается от ранее найденного: нельзя определить объект
        if (ret >= 0 && ret != ind) return VAL_WRONG;
        // объекта нет: запомнить объект
        if (ret == VAL_WRONG) ret = ind;
        // следующая action
        break;
      }
    }
  }
  return ret;
};

/**
 * ДОСТУПНЫЕ ОПЕРАЦИИ: ИСКЛЮЧИТЬ ИЗ СПИСКА
 */
export const delActions = (actions: string[], actionsDel: string[]): string[] =>
  actions.filter((item) => !actionsDel.includes(item));
