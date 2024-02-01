/**
 * !!!!!!!!! ВАЖНО !!!!!!!!!!!
 * ЕДИНЫЙ ФАЛ ДЛЯ БЭКА И ФРОНТА
 * ПРИ ИЗМЕНЕНИИ ОБЯЗАТЕЛЬНО МЕНЯТЬ И ЕГО В ДРУГОМ МЕСТЕ
 */

type Nullable<T> = T | null;

/** access_token */
export interface IToken {
  user_id: number;
  staff_id: Nullable<number>;
  username: string; // логин
  current_emp_id?: Nullable<number>;
  fio: string;
  url: string; // кластер
  post?: string; // не обязательное поле
  session_id: number; // сессия пользователя: id
  session_timeout: number; // сессия пользователя: допустимое время бездействия, сек.
  ip: string; // ip пользователя
}

/** access_token_full */
export interface ITokenAccessFull {
  exp: number;
  iat: number;
  payload: IToken;
}

/** refresh_token_full */
export interface ITokenRefreshFull {
  access_token: string;
  exp: number;
  iat: number;
  payload: IToken;
}
