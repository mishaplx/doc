import { EntityManager, LessThan } from "typeorm";

import { AUTH } from "src/auth/auth.const";
import { UserEntity } from "src/entity/#organization/user/user.entity";
import { getSettingsValInt } from "src/modules/settings/settings.util";
import { SETTING_CONST } from "src/modules/settings/settings.const";

/** количество неверных попыток ввода пароля */
export const getLoginWrongCount = (managerLocal: EntityManager): number =>
  getSettingsValInt({
    org: managerLocal.connection.options.database as string,
    key: SETTING_CONST.LOGIN_WRONG_COUNT.nm,
  });

/** время блокировки пользователя после максимального количества неверных попыток ввода пароля, сек. */
export const getLoginWrongExpire = (managerLocal: EntityManager): number =>
  getSettingsValInt({
    org: managerLocal.connection.options.database as string,
    key: SETTING_CONST.LOGIN_WRONG_EXPIRE.nm,
  }) * 60; // мин. -> сек.

/**
 * ЛОГИН: ЗАРЕГИСТРИРОВАТЬ УСПЕШНУЮ АУТЕНТИФИКАЦИЮ
 */
export const regUserLoginSuccess = async (args: {
  managerLocal: EntityManager;
  user_id: number;
}): Promise<void> => {
  const { managerLocal, user_id } = args;
  await managerLocal.update(
    UserEntity,
    {
      id: user_id,
    },
    {
      date_auth_success: new Date(),
      date_auth_wrong: null,
      count_auth_wrong: 0,
    },
  );
};

/**
 * ЛОГИН: ЗАРЕГИСТРИРОВАТЬ ПОПЫТКУ АУТЕНТИФИКАЦИИ - НЕВЕРНЫЙ ПАРОЛЬ
 * @return уточняющее сообщение об ошибке
 */
export const regUserLoginWrong = async (args: {
  managerLocal: EntityManager;
  user_id: number;
}): Promise<string> => {
  const { managerLocal, user_id } = args;
  await managerLocal
    .createQueryBuilder()
    .update(UserEntity)
    .where({ id: user_id })
    .set({
      count_auth_wrong: () => "count_auth_wrong + 1",
      date_auth_wrong: new Date(),
    })
    .execute();
  const { count_auth_wrong } = await managerLocal.findOneByOrFail(UserEntity, { id: user_id });
  const count_auth_max = getLoginWrongCount(managerLocal);
  const expire_auth_val = getLoginWrongExpire(managerLocal);
  return (
    AUTH.ERR.SESSION.LOGIN +
    `. Количество попыток входа - ${count_auth_wrong}. ` +
    (count_auth_wrong < count_auth_max
      ? `Осталось ${count_auth_max - count_auth_wrong}.`
      : `Вход в систему заблокирован. Ожидайте ${(expire_auth_val / 60) >> 0} мин.`)
  );
};

/**
 * ЛОГИН: ПРОВЕРИТЬ ИСЧЕРАПАНЫ ЛИ ПОПЫТКИ РЕГИСТРАЦИИ
 * @return уточняющее сообщение об ошибке
 */
export const isUserLoginValid = async (args: {
  managerLocal: EntityManager;
  user_id: number;
}): Promise<boolean> => {
  const { managerLocal, user_id } = args;
  let ret: boolean;
  try {
    const { count_auth_wrong } = await managerLocal.findOneByOrFail(UserEntity, { id: user_id });
    ret = count_auth_wrong < getLoginWrongCount(managerLocal);
  } catch {
    ret = false;
  }
  return ret;
};

/**
 * ЛОГИН: СБРОСИТЬ ПОПЫТКИ РЕГИСТРАЦИИ
 * ДЛЯ ЗАДАННОГО ПОЛЬЗОВАТЕЛЯ (ПРИНУДИТЕЛЬНО)
 */
export const resetUserLoginValidPersonal = async (args: {
  //TODO Unused constant resetUserLoginValidPersona?
  managerLocal: EntityManager;
  user_id: number;
}): Promise<void> => {
  const { managerLocal, user_id } = args;
  await managerLocal.update(
    UserEntity,
    {
      id: user_id,
    },
    {
      date_auth_wrong: null,
      count_auth_wrong: 0,
    },
  );
};

/**
 * ЛОГИН: СБРОСИТЬ ПОПЫТКИ РЕГИСТРАЦИИ
 * ДЛЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (ПОСЛЕ ИСТЕЧЕНИЯ ВРЕМЕНИ ОЖИДАНИЯ)
 */
export const resetUserLoginValidAll = async (args: {
  managerLocal: EntityManager;
}): Promise<void> => {
  const dateUserExp = new Date(
    new Date().getTime() - getLoginWrongExpire(args.managerLocal) * 1000,
  );
  await args.managerLocal.update(
    UserEntity,
    {
      date_auth_wrong: LessThan(dateUserExp),
    },
    {
      date_auth_wrong: null,
      count_auth_wrong: 0,
    },
  );
};
