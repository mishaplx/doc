import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { Field, ObjectType } from "@nestjs/graphql";
import { isInstance } from "class-validator";

import { wLogger } from "../../modules/logger/logging.module";
import { MSG, PREF_ERR } from "../enum/enum";

@ObjectType()
export class ResponseType {
  @Field({ nullable: true })
  status: number;
  @Field({ nullable: true })
  err: string;
  @Field({ nullable: true })
  message: string;
  @Field({ nullable: true })
  file_id: number;

  constructor(status: number, err: string, message: string, file_id = null) {
    this.status = status;
    this.err = err;
    this.message = message;
    this.file_id = file_id;
  }
}

/**********************************************
 * НАЛИЧИЕ ПРЕФИКСА <!> В ТЕКСТЕ ОШИБКИ
 **********************************************/
export const isPrefErr = (msg: string): boolean =>
  msg?.slice(0, PREF_ERR.length) == PREF_ERR && msg?.length > PREF_ERR.length;

// export const isPrefErr = (val: string | HttpException): boolean => {
//   const valNew = (isInstance(val, HttpException)) ? (val as HttpException)?.message : val as string;
//   return valNew?.slice(0, PREF_ERR.length) == PREF_ERR && valNew?.length > PREF_ERR.length;
// };


/**********************************************
 * СООБЩЕНИЕ ОБ ОШИБКЕ БЕЗ ПРЕФИКСА <!>
 **********************************************/
export const errWithoutPref = (msg: string): string =>
  isPrefErr(msg) ? msg?.slice(PREF_ERR.length) : msg;

/**********************************************
 * ОТПРАВИТЬ ОШИБКУ ЧЕРЕЗ REST
 **********************************************/
export const setErrorRest = (args: { msg: string; err: any; res?: any }): void => {
  const { msg, err, res } = args;
  const val = err?.message ?? (err as string);
  const ret = isPrefErr(val) ? val : PREF_ERR + msg;
  if (res) {
    if (!res.finished) {
      wLogger.error(err);
      res.status(HttpStatus.BAD_REQUEST).send({
        ...err,
        error: ret,
      });
    }
  } else {
    // обработка через фильтры
    throw new BadRequestException(ret);
  }
};

/**********************************************
 * ОТПРАВИТЬ ОШИБКУ ЧЕРЕЗ GRAPHQL
 **********************************************/
export const setErrorGQL = (
  msg = "",
  err: HttpException | string = undefined,
  code: any = HttpStatus.BAD_REQUEST,
): HttpException => {
  const s = PREF_ERR + msg;
  wLogger.error(msg);
  const val = (err as HttpException)?.message ?? (err as string);
  const ret = isPrefErr(val) ? err : s;
  return new HttpException(ret, code);
};

export const httpExceptErr = (err: HttpException): HttpException => {
  const s = err?.message ?? MSG.ERROR.COMMON;
  wLogger.error(err);
  return new HttpException(s, HttpStatus.BAD_REQUEST);
};

/**********************************************
 * сгенерировать ошибку с сообщением для конечного пользователя
 * для работы в другом потоке нужно инициализировать Winston
 * TODO: оптимизировать, сделать передачу кода ошибки
 * @param(param) -
 **********************************************/
export const customError = (
  msg: string,
  err?: HttpException,
  param?: any,
): any => {
  const msg2 = err?.message;
  if (isPrefErr(msg2)) throw err;
  if (isPrefErr(msg)) throw msg;
  wLogger.error(
    errWithoutPref(msg) as any,
    param ? { param: param } : undefined,
    (err as any)?.query,
    (err as any)?.parameters,
  );
  throw new Error(PREF_ERR + msg);
};

/**********************************************
 * проверить переменную на ошибку HttpException
 **********************************************/
export const validError = (val: any, msg = ""): void => {
  if (isInstance(val, HttpException)) {
    const msg2 = val?.message;
    if (isPrefErr(msg2)) {
      customError(msg2);
    } else {
      customError(msg != "" ? PREF_ERR + msg : "");
    }
  }
};
