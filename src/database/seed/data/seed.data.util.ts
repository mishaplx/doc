import { EntityManager, EntityMetadata, EntityTarget, In, Not } from "typeorm";
import * as bcrypt from "bcryptjs";

import "dotenv/config";

interface IhashPassword {
  password: string;
  username: string;
}

type SeedType<T> =
{
  [D in keyof T]?: T[D]
} & {
  id: number;
  username?: string;
  password?: string;
};


/**
 * ВНЕСТИ ДАННЫЕ В ТАБЛИЦУ НА ОСНОВЕ seedList
 * @param(bStartEmpty) - boolean: Запускать только при пустой таблице
 * @param(bStartNew) - boolean: Запускать только для новых записей (по id), существующие записи НЕ ИЗМЕНЯЮТСЯ
 * @param(bDel) - boolean: Удалить записи без сидов
 * @param(bUniq) - boolean: Устранять коллизии с повторяющимися значениями уникальных полей
 * @param(bUser) - boolean: Добавить дополнительные поля: логин и пароль
 * @param(cb) - callback function: Функция, выполняемая для каждой записи для ее корректировки
 * @param(updateFields) - string[]: Обновить только поля для существующих записей, сначала bStartNew. Если [] - все поля.
 *
 * при отсутствии параметров
 * новые записи создаются, существующие записи корректируются по всем полям, отсутствующие в сидах записи НЕ УДАЛЯЮТСЯ
 *
 * если создается новая запись, то updateFields не имеет значения: создаются ВСЕ поля
 *
 * АЛГОРИТМ РАБОТЫ
 *
 * сначала проверить bStartEmpty
 *
 * потом удалить записи если bDel
 *
 * потом добавить проверить bStartNew
 *
 * потом изменить если bUser
 *
 * потом вызвать cb
 *
 * потом проверить наличие записи в БД, которая вызовет конфликт из-за наличия совпадающих значений с сидом в уникальных полях
 * в этом случае корректируется имеющаяся в БД запись, а id ей присваивается из сида
 *
 * потом insert или update
 */
export const updateData = async <T, A extends Partial<keyof T>>(
  manager: EntityManager,
  entityClass: EntityTarget<T>,
  seedList: SeedType<T>[],
  param: {
    bDel?: boolean;
    bUser?: boolean;
    bStartEmpty?: boolean;
    bStartNew?: boolean;
    updateFields?: A[];
    cb?: (x: SeedType<T>) => SeedType<T>;
  } = {},
): Promise<void> => {
  const {
    bDel = false,
    bUser = false,
    bStartEmpty = false,
    bStartNew = false,
    updateFields = [],
    cb,
  } = param;
  if ((!manager.queryRunner) || (seedList.length == 0)) return;
  const meta = manager.connection.getMetadata(entityClass);

  // Запускать только при пустой таблице
  if (bStartEmpty) {
    const sql = `SELECT COUNT(*) as count FROM "${meta.schema}"."${meta.tableName}"`;
    const recCount = ((await manager.queryRunner.query(sql)) ?? [{ count: 0 }]).at(0).count;
    if (recCount != "0") return;
  }

  // SEED: установить дополнительные поля
  if (bUser) {
    const userCred = await hashPassword();
    seedList[0].username = userCred.username;
    seedList[0].password = userCred.password;
  }

  // БД: удалить записи без сидов
  if (bDel) {
    const seedIds = Not(In(seedList.map((el) => el.id)));
    await manager.delete(entityClass, { id: seedIds });
  }

  // БД: добавить записи из сидов
  for (let seedItem of seedList) {
    // существует ли запись в БД соответствующая seedItem (по id)
    // const entityItem = await manager.findOneBy(entityClass, seedItem.id ); ОШИБКА
    const sqlGet = `SELECT id FROM "${meta.schema}"."${meta.tableName}" WHERE id=${seedItem.id}`;
    const isRecIdExist = ((await manager.queryRunner.query(sqlGet)) as any[]).length > 0;

    // Вставить только новые строки
    if (bStartNew && isRecIdExist) continue;

    // Вызвать callback обработчик сида
    if (cb) {
      seedItem = cb(seedItem);
    }

    // проверить наличие записи в БД, которая вызовет конфликт из-за наличия совпадающих значений с сидом в уникальных полях
    const old_id = await getUniqRecId({
      manager: manager,
      meta: meta,
      seed: seedItem,
      updateFields: updateFields,
    });

    // id изменяемой записи
    // если есть запись блокирующая внесение сида,
    // то сид писать в эту запись с изменением ее id на id из сида
    const modifyRecId = (old_id > -1) ? old_id : ((isRecIdExist) ? seedItem.id : -1 );

    // БД: внести изменения
    const sql = getSqlWrite({
      meta: meta,
      seed: seedItem,
      modifyRecId: modifyRecId,
      updateFields: updateFields,
    });
    await manager.queryRunner.query(sql);
  }

  // БД: переустановить sequences
  const sql = `SELECT sad.sequences_update()`;
  await manager.queryRunner.query(sql);
};


/**
 * ОБРАБОТАТЬ КАЖДУЮ ЗАПИСЬ
 * @param(cb) - callback function: Функция, выполняемая для каждой обрабатываемой записи
 * !!! ВОЗМОЖНО СЛОМАНА !!!
 */
export const modifyRecords = async <T>(
  manager: EntityManager,
  entityClass: EntityTarget<T>,
  cb: (x: T) => Promise<Partial<T>>,
): Promise<void> => {
  if (!manager.queryRunner) return;
  const meta = manager.connection.getMetadata(entityClass);

  const limit_step = 500; // читать блоками
  let limit_offset = 0;
  while (true) {
    const sql_get = `SELECT * FROM "${meta.schema}"."${meta.tableName}" ORDER BY id ASC LIMIT ${limit_step} OFFSET ${limit_offset}`;
    const recs = (await manager.queryRunner.query(sql_get)) as T[];
    for (const rec of recs) {
      const rec_changed_dict = await cb(rec);
      if (Object.keys(rec_changed_dict).length > 0) {
        const sql_set = getSqlWrite({
          meta: meta,
          seed: { ...rec_changed_dict, id: (rec as any).id } as SeedType<typeof entityClass>,
          modifyRecId: (rec as any).id,
        });
        await manager.queryRunner.query(sql_set);
      }
    }

    if (recs.length !== limit_step) break;
    limit_offset += limit_step;
  }
};


/**
 * ДОБАВИТЬ К СИДУ ЛОГИН И ПАРОЛЬ
 */
export const hashPassword = async (): Promise<IhashPassword> => {
  const password = await bcrypt.hash(process.env.DB_PASS_SEED, Number(process.env.JWT_SALT));
  const username =
    process.env.DB_LOGIN_SEED + process.env.DB_LOGIN_SEED[0] + process.env.DB_LOGIN_SEED[0];
  return { password, username };
};


/**
 * СФОРМИРОВАТЬ ЗАПРОС НА ЗАПИСЬ В ТАБЛИЦУ
 * @param(seed) - обязательно должен иметь поле id
 * @param(modifyRecId) - id изменяемой записи, иначе вставка новой записи
 * @param(updateFields) - если [] - все поля
 * если создается новая запись, то updateFields не имеет значения: создаются ВСЕ поля
 */
const getSqlWrite = <T, A extends Partial<keyof T>>(args: {
  meta: EntityMetadata,
  seed: SeedType<T>;
  modifyRecId?: number;
  updateFields?: A[];
}): string => {
  const { meta, seed, modifyRecId = -1, updateFields = [] } = args;
  // наличие записи для корректировки сидом
  const isRecIdExist = (modifyRecId > -1);
  // список полей и значений словаря в строку
  // все поля если (ИЛИ):
  // - запись не существует
  // - нет списка полей
  const keys = Object.keys(seed)
    .filter((key) => (!isRecIdExist || !updateFields.length || (updateFields as string[]).includes(key)))
    .map((key) => '"' + key + '"')
    .join(",");
  const vals = Object.keys(seed)
    .filter((key) => (!isRecIdExist || !updateFields.length || (updateFields as string[]).includes(key)))
    .map((key) => getSqlVal({ seed: seed, key: key }))
    .join(",");

  // нельзя UPDATE для одного столбца
  const count_pair = Object.keys(seed)
    .filter((key) => (!updateFields.length || (updateFields as string[]).includes(key)))
    .length;
  const s_on = (count_pair>1)?'(':'';
  const s_off = (count_pair>1)?')':'';

  // вставить или создать запись в БД
  // работа через sql, т.к. через ORM невозможно задать id
  return isRecIdExist
    ? `UPDATE "${meta.schema}"."${meta.tableName}" SET ${s_on}${keys}${s_off} = ${s_on}${vals}${s_off} WHERE id=${modifyRecId}`
    : `INSERT INTO "${meta.schema}"."${meta.tableName}"(${keys}) VALUES (${vals}) ON CONFLICT DO NOTHING`;
};


/**
 * БД: ПОЛУЧИТЬ СПИСОК ГРУПП УНИКАЛЬНЫХ ИНДЕКСОВ (кроме id)
 */
const getUniqFieldsGroup = async (meta: EntityMetadata): Promise<string[][]> => {
  const ret: string[][] = [];
  for (const obj of meta.uniques) {
    const lst: string[] = obj.columns.map((x) => x.databaseName);
    ret.push(lst);
  }
  return ret;
}


/**
 * ПОЛУЧИТЬ ID ПЕРВОЙ ЗАПИСИ В БД
 * С УНИКАЛЬНЫМИ ЗНАЧЕНИЯМИ ПОЛЕЙ ИЗ SEED (КРОМЕ ПОЛЯ ID)
 *
 * REC.ID <> SEED.ID
 *
 * ТОЛЬКО ПОЛЯ updateFields. ЕСЛИ updateFields = [] - АНАЛИЗИРОВАТЬ ВСЕ ИНДЕКСЫ
 */
const getUniqRecId = async <T, A extends Partial<keyof T>> (args: {
  manager: EntityManager,
  meta: EntityMetadata;
  seed: SeedType<T>;
  updateFields: A[];
}): Promise<number> => {
  const { manager, meta, seed, updateFields } = args;

  // получить группы уникальных полей
  const uniqueFieldsGroup = await getUniqFieldsGroup(meta) as string[][];

  // искать запись: поля из uniqueFields, значения из seed
  for (const uniqueFields of uniqueFieldsGroup) {
    let sql = uniqueFields
    .filter((field) => ( (field in seed) && (!updateFields.length || (updateFields as string[]).includes(field)) ) )
    .map((field) => field + '=' + getSqlVal({ seed: seed, key: field }) )
    .join(" AND ");
    if (sql.length) {
      sql = `SELECT id FROM "${meta.schema}"."${meta.tableName}" WHERE id<>${seed.id} AND ${sql} LIMIT 1;`;
      const rec = await manager.queryRunner.query(sql);
      if (rec.length) {
        return rec[0].id;
      }
    }
  }
  return -1;
};


/**
 * СФОРМИРОВАТЬ ДЛЯ SQL ЗНАЧЕНИЕ СИДА С УЧЕТОМ ЕГО ТИПА
 */
const getSqlVal = <T>(args: {
  seed: SeedType<T>;
  key: string;
}): string => {
  let val = args.seed[args.key];
  switch (typeof val) {
    case "string":
      val = "'" + val + "'";
      break;
    case "object":
      val = (val === null) ? "null" : "'" + JSON.stringify(val) + "'";
      break;
    case "undefined":
      val = "null";
  }
  return val;
}
