import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { IToken, ITokenRefreshFull } from "src/BACK_SYNC_FRONT/auth";
import { AUTH } from "../auth.const";
import { getSettingsValInt } from "src/modules/settings/settings.util";
import { getTimeoutAuthSession } from "../session/auth.session.utils";
import { SETTING_CONST } from "src/modules/settings/settings.const";

/**
 *  ТОКЕН: ПРОЧИТАТЬ КАК СТРОКУ
 */
export const cutTokenAccessAuthorization = (authorization: string): string =>
  authorization?.replace("Bearer", "")?.trim();

export const cutTokenAccessHeader = (header: any): string =>
  cutTokenAccessAuthorization(header.Authorization ?? header.authorization);

export const cutTokenAccessRequest = (request: any): string =>
  cutTokenAccessAuthorization(request?.get("Authorization"));

/**
 *  TOKEN_ACCESS: РАСПАРСИТЬ
 */
export const parseTokenAccess = (token_access: string): IToken => {
  try {
    if (token_access) {
      return new JwtService().decode(token_access)["payload"] as IToken;
    } else throw AUTH.ERR.TOKEN.NONE;
  } catch (err) {
    throw new UnauthorizedException();
  }
};
export const parseTokenAccessHeader = (header: any): IToken =>
  parseTokenAccess(cutTokenAccessHeader(header));
export const parseTokenAccessRequest = (request: any): IToken =>
  parseTokenAccess(cutTokenAccessRequest(request));

/**
 *  TOKEN_ACCESS: ПРОВЕРИТЬ + РАСПАРСИТЬ
 *  @description
 *  ПРОВЕРЯЕТСЯ: ВРЕМЯ ЖИЗНИ ТОКЕНА,
 *  НЕ ПРОВЕРЯЕТСЯ: НАЛИЧИЕ И НАСТРОЙКИ СЕССИИ
 */
export const verifyTokenAccess = async (token_access: string): Promise<IToken> => {
  try {
    if (token_access) {
      return await new JwtService().verify(token_access, {
        secret: process.env.JWT_SECRET_ACCESS,
      }).payload;
    } else throw AUTH.ERR.TOKEN.NONE;
  } catch (err) {
    throw new UnauthorizedException();
  }
};

/**
 *  TOKEN_REFRESH: РАСПАРСИТЬ
 */
export const parseTokenRefresh = (token_refresh: string): ITokenRefreshFull => {
  try {
    if (token_refresh) {
      return new JwtService().decode(token_refresh) as ITokenRefreshFull;
    } else throw AUTH.ERR.TOKEN.NONE;
  } catch (err) {
    throw new UnauthorizedException();
  }
};

/**
 *  ТОКЕН ACCESS: ВРЕМЯ ЖИЗНИ, СЕК.
 */
export const getExpTokenAccess = (org: string): number =>
  getSettingsValInt({
    org: org,
    key: SETTING_CONST.JWT_EXPIRE_ACCESS.nm,
  }) * 60; // мин. -> сек.

/**
 *  ТОКЕН REFRESH: ВРЕМЯ ЖИЗНИ, СЕК.
 */
export const getExpTokenRefresh = (org: string): number =>
  getSettingsValInt({
    org: org,
    key: SETTING_CONST.JWT_EXPIRE_REFRESH.nm,
  }) * 60 * 60; // час. -> сек.

/**
 *  ТОКЕН: ПРОВЕРКА НА АКТУАЛЬНОСТЬ (ДОПУСТИМОЕ ВРЕМЯ БЕЗДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ)
 */
export const validExpTokenAccess = (org: string, date_activity: Date): boolean =>
  !!date_activity &&
  date_activity?.getTime() + getTimeoutAuthSession(org) * 1000 > new Date().getTime();
