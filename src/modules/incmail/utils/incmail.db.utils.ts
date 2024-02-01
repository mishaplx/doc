import { EntityManager, SelectQueryBuilder } from "typeorm";

import { OrderIncmailsEnum, SortEnum } from "../../../common/enum/enum";
import { IncmailEntity } from "../../../entity/#organization/inmail/incmail.entity";
import { GetIncmailArgs } from "../dto/get-incmails.args";
import { OrderIncmailsInput } from "../dto/order-incmails-request.dto";

/********************************************
 * ПОЧТОВЫЙ ИМПОРТ: НАЙТИ ПИСЬМА
 ********************************************/
export function setQueryBuilderIncmail(
  args: GetIncmailArgs,
  orderBy: OrderIncmailsInput,
  queryBuilder: SelectQueryBuilder<IncmailEntity>,
): void {
  const { id, sender, subject, dt } = args;

  if (id) {
    queryBuilder.andWhere("incmail.id = :id", { id });
  }

  if (sender) {
    queryBuilder.andWhere("incmail.sender ILIKE :sender", { sender: `%${sender}%` });
  }

  if (subject) {
    queryBuilder.andWhere("incmail.subject ILIKE :subject", { subject: `%${subject}%` });
  }

  if (dt) {
    queryBuilder.andWhere("incmail.dt::date = :dt", { dt });
  }

  getOrderAllIncmails(queryBuilder, orderBy);
}

function getOrderAllIncmails(
  queryBuilder: SelectQueryBuilder<IncmailEntity>,
  orderBy: OrderIncmailsInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("incmail.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderIncmailsEnum.id:
      queryBuilder.orderBy("incmail.id", orderBy.sortEnum);
      break;
    case OrderIncmailsEnum.sender:
      queryBuilder.orderBy("incmail.sender", orderBy.sortEnum);
      break;
    case OrderIncmailsEnum.subject:
      queryBuilder.orderBy("incmail.subject", orderBy.sortEnum);
      break;
    case OrderIncmailsEnum.dt:
      queryBuilder.orderBy("incmail.dt", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("incmail.id", SortEnum.DESC);
  }
}

/********************************************
 * Сравнить БД и сообщения из папки входящие
 * Удалть ненужные записи из БД, если они удалены из входящих
 * @param uidsInbox - Идентификаторы входящих сообщений
 ********************************************/
export const compareIncmail = async (
  manager: EntityManager,
  uidsInbox: string[],
): Promise<number[]> => {
  // Массив уже загруженных писем
  const oldIncmail: IncmailEntity[] = await manager.find(IncmailEntity, {
    select: { id: true, uid: true },
  });
  const uids: string[] = oldIncmail.map((incmail) => incmail.uid);

  // Массив для писем, которые следует удалить
  const forDel: number[] = [];

  uids.forEach((uid, index) => {
    const indexNewUid: number = uidsInbox.indexOf(uid);
    if (indexNewUid === -1) {
      // Удалить ненужные записи из БД
      if (oldIncmail[index]) {
        forDel.push(oldIncmail[index].id);
      }
    }
  });

  return Promise.resolve(forDel);
};
