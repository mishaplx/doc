import { IToken } from "src/BACK_SYNC_FRONT/auth";
// import "dotenv/config";
import { customError } from "src/common/type/errorHelper.type";
import { UserSessionEntity } from "src/entity/#organization/user/userSession.entity";
import { SETTING_CONST } from "src/modules/settings/settings.const";
import { getSettingsValInt } from "src/modules/settings/settings.util";
import { DeleteResult, EntityManager } from "typeorm";

import { wLogger } from "../../modules/logger/logging.module";
import { AUTH } from "../auth.const";
import { validExpTokenAccess } from "../token/auth.token.utils";
import { UserSessionTypeEnum } from "./auth.session.const";

/**
 * СЕССИЯ: СОЗДАТЬ
 */
export const createAuthSession = async (args: {
  managerLocal: EntityManager;
  user_id: number;
  type_session?: UserSessionTypeEnum;
}): Promise<UserSessionEntity> => {
  const { managerLocal, user_id, type_session } = args;
  const now = new Date();

  // можно только save, т.к. существование записи проверяется по id
  return await managerLocal.save(UserSessionEntity, {
    user_id: user_id,
    date_create: now,
    date_activity: now,
    type_session: type_session,
  });
};

/**
 * СЕССИЯ: ОБНОВИТЬ
 */
export const updateAuthSession = async (args: {
  managerLocal: EntityManager;
  session_id: number;
  date_activity?: Date;
  date_expiration?: Date;
  refresh_token?: string;
  note?: string;
}): Promise<UserSessionEntity> => {
  const userSessionEntity = await args.managerLocal.findOneByOrFail(UserSessionEntity, {
    id: args.session_id,
  });
  return await args.managerLocal.save(UserSessionEntity, {
    ...userSessionEntity,
    date_activity: args.date_activity,
    date_expiration: args.date_expiration,
    refresh_token: args.refresh_token,
    note: args.note,
  });
};

/**
 * СЕССИЯ: ПРОВЕРИТЬ НА АКТУАЛЬНОСТЬ
 * - проверить на давность последней активности
 * - обновить время последней активности
 */
export const validAuthSession = async (args: {
  managerLocal: EntityManager;
  access_token: IToken;
  refresh_date_activity?: boolean;
}): Promise<boolean> => {
  const { managerLocal, access_token, refresh_date_activity = true } = args;
  let ret = true;

  try {
    // сессия пользователя
    if (!access_token.session_id) customError(AUTH.ERR.SESSION.NONE);
    const userSessionEntity = await managerLocal.findOneByOrFail(UserSessionEntity, {
      id: access_token.session_id,
      user_id: access_token.user_id,
    });

    // проверить тайминг
    ret = validExpTokenAccess(access_token.url, userSessionEntity.date_activity);

    // если все ок - записать текущую активность как последнюю
    if (ret && refresh_date_activity) {
      await updateAuthSession({
        managerLocal: args.managerLocal,
        session_id: access_token.session_id,
        date_activity: new Date(),
      });
    }
  } catch (err) {
    wLogger.info('Не найдена сессия пользователя', access_token, err);
    ret = false;
  }
  return ret;
};

/**
 * СЕССИЯ: УДАЛИТЬ
 */
export const delAuthSession = async (args: {
  managerLocal: EntityManager;
  session_id: number;
}): Promise<DeleteResult> => {
  return await args.managerLocal.delete(UserSessionEntity, { id: args.session_id });
};


/**
 * СЕССИЯ: КОЛИЧЕСТВО
 */
export const countAuthSession = async (args: {
  managerLocal: EntityManager;
  user_id: number;
}): Promise<number> => {
  const { managerLocal, user_id } = args;
  return await managerLocal.countBy(UserSessionEntity, {
    user_id: user_id,
  });
};


/**
 *  СЕССИЯ: ВРЕМЯ БЕЗДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ, СЕК.
 */
export const getTimeoutAuthSession = (org: string): number =>
  getSettingsValInt({
    org: org,
    key: SETTING_CONST.LOGIN_TIMEOUT.nm,
  }) * 60; // мин. -> сек.
