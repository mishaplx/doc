/**
 * !!!!!!!!! ВАЖНО !!!!!!!!!!!
 * ЕДИНЫЙ ФАЛ ДЛЯ БЭКА И ФРОНТА
 * ПРИ ИЗМЕНЕНИИ ОБЯЗАТЕЛЬНО МЕНЯТЬ И ЕГО В ДРУГОМ МЕСТЕ
 */

/** КАСТОМНЫЕ КОДЫ ОШИБОК */
export enum APIErrorCodeEnum {
  auth_timeout = 480,
  auth_ip = 481,
  auth_block = 482,
  doc_reg_exist = 490,
}
