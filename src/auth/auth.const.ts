const ERR = "Ошибка авторизации";
export const AUTH = {
  ERR: {
    COMMON: ERR,
    TOKEN: {
      NONE: ERR + ": не найден токен",
      INVALID: ERR + ": невалидный токен",
    },
    USER: {
      NONE: ERR + ": пользователь не найден",
      BLOCK: ERR + ": пользователь заблокирован",
    },
    SESSION: {
      CREATE: ERR + ": сессия не создана",
      UPDATE: ERR + ": сессия не обновлена",
      DELETE: ERR + ": сессия не удалена",
      NONE: ERR + ": сессия отсутствует",
      LOGIN: ERR + ": неверный логин или пароль",
      IP: ERR + ": запрос с не своего IP",
      TIMEOUT: ERR + ": превышен лимит времени отсутствия активности пользователя",
      CLOSE: 'Ваша сессия завершена принудительно'
    },
  },
};

export type JwtPayload = {
  id: string;
  username: string;
};
export type JwtPayloadWithRefreshToken = JwtPayload & { refreshToken: string };

