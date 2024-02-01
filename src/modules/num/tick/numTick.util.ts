import { EntityManager } from "typeorm";

import { customError } from "src/common/type/errorHelper.type";
import { NumEntity } from "src/entity/#organization/num/num.entity";
import { NumCountHistoryEntity } from "src/entity/#organization/num/numCountHistory.entity";
import { NumCountReserveEntity } from "src/entity/#organization/num/numCountReserve.entity";

/**
 * СЧЕТЧИК: ЗАРЕЗЕРВИРОВАТЬ НОМЕР
 */
export const reserveNumTickUtil = async (args: {
  manager: EntityManager;
  num_id: number;
  privat: boolean;
  note: string;
  emp_id: number;
}): Promise<number> => {
  const { manager, num_id, privat, note, emp_id } = args;

  // получить значение из очереди
  const val = (await takeNumTickUtil({
    manager: manager,
    num_id: num_id,
    only_queue: true,
    emp_id: emp_id,
  })) as number;

  // зарезервировать это значение
  const numCountReserveEntity = await manager.create(NumCountReserveEntity, {
    num_id: num_id,
    val: val,
    val_free: false,
    note: note,
    emp_id: privat ? emp_id : undefined,
  });
  await manager.save(numCountReserveEntity);
  return val;
}

/**
 * СЧЕТЧИК: СНЯТЬ РЕЗЕРВ НОМЕРА
 */
export const unreserveNumTickUtil = async (args: {
  manager: EntityManager;
  num_id: number;
  val: number;
  emp_id: number;
}): Promise<number> => {
  const { manager, num_id, val, emp_id } = args;

  // допустима ли операция
  const numCountReserveEntity = await manager.findOneBy(NumCountReserveEntity, {
    num_id: num_id,
    val: val,
  });
  if (
    !numCountReserveEntity ||
    (numCountReserveEntity?.emp_id != null && numCountReserveEntity?.emp_id != emp_id)
  )
    customError("Не найден зарезервированный номер");

  await manager.update(
    NumCountReserveEntity,
    {
      num_id: num_id,
      val: val,
    },
    {
      val_free: true,
    },
  );
  return val;
}

/**
 * СЧЕТЧИК: ВЗЯТЬ НОМЕР
 * @param val - использовать ранее зарезервированный номер (указать)
 * @param only_queue - исключить получение резервируемого номера (только очередной)
 * не использовать, применяется для резервирования НОВЫХ номеров в reserveNumTick
 * @param prepare (bool=false) - получить, но не регистрировать номер (предварительный номер)
 *
 * резервируется только очередной номер (нельзя зарезервировать прошедший или будущий номер)
 *
 * зарезервированные номера выдаются только по запросу конкретно этого номера
 *
 * можно зарезервировать номер только для себя или не только для себя (признак privat)
 *
 * при сбросе счетчика (например, в конце года) все зарезервированнные номера стираются
 *
 * при сбросе счетчика (например, в конце года) его значение и количество зарезервированных номеров записывается в историю
 *
 * при отказе от зарезервированного номера он выдается в первую очередь по запросу очередного номера
 */
export const takeNumTickUtil = async (args: {
  manager: EntityManager;
  emp_id: number;
  num_id: number;
  val?: number;
  only_queue?: boolean;
  prepare?: boolean;
}): Promise<number> => {
  const { manager, emp_id, num_id, val: val_request = 0, only_queue = false, prepare = false } = args;
  let val_new = 0;
  let numCountReserveEntity: NumCountReserveEntity;

  const numEntity = await manager.findOneBy(NumEntity, { id: num_id });
  if (!numEntity) customError("Не найден счетчик нумератора");

  // при необходимости сбросить счетчики
  checkNumResetUtil({
    manager: manager,
    numEntity: numEntity,
  });
  // const { count_val: val_old } = numEntity;

  /**
   * ВАРИАНТ 1: запрос на ранее зарезервированное значение
   */
  if (val_request > 0) {
    if (only_queue) customError("Невозможно получить номер");

    // если зарезервированный номер есть и emp_id совпадает (если оно задано)
    numCountReserveEntity = await manager.findOneBy(NumCountReserveEntity, {
      num_id: num_id,
      val: val_request,
    });
    if (
      !numCountReserveEntity ||
      (numCountReserveEntity?.emp_id != null && numCountReserveEntity?.emp_id != emp_id)
    )
      customError("Не найден зарезервированный номер");

    // для не предварительного номера: удалить резервирование
    if (!prepare) {
      await manager.delete(NumCountReserveEntity, { id: numCountReserveEntity.id });
    }

    // взять запрашиваемый номер
    val_new = val_request;
    // return true; не нужно чтобы обновить дату

  /**
   * ВАРИАНТ 2: взять значение по умолчанию (сначала из освобожденного резерва, при отсутствии - инкремент)
   */
  } else {
    // есть ли освобожденные ранее резервированные номера
    numCountReserveEntity = await manager.findOne(NumCountReserveEntity, {
      where: {
        num_id: num_id,
        val_free: true,
      },
      order: {
        val: "ASC",
      },
    });
    if (!only_queue && numCountReserveEntity) {
      // взять зарезервированный номер
      val_new = numCountReserveEntity.val;
      // для не предварительного номера: удалить его из списка зарезервированных
      if (!prepare) {
        await manager.delete(NumCountReserveEntity, {
          id: numCountReserveEntity.id,
        });
      }
      // return true; не нужно чтобы обновить дату
    } else {
      // иначе взять очередной номер
      val_new = numEntity.count_val + 1;
    }
  }

  // для не предварительного номера: обновить счетчик
  if (!prepare) {
    await manager.update(
      NumEntity,
      { id: num_id },
      {
        count_val: val_new,
        count_tick: new Date(),
      },
    );
  }

  return val_new;
}


/**
 * ПРОВЕРИТЬ СЧЕТЧИК НА НЕОБХОДИМОСТЬ СБРОСА
 * ПРИ НЕОБХОДИМОСТИ СБРОСИТЬ
 * @return true - счетчик сброшен
 */
export const checkNumResetUtil = async (args: {
  manager: EntityManager;
  numEntity: NumEntity;
}): Promise<boolean> => {
  const { manager, numEntity } = args;
  let ret = false;

  const { count_tick, count_reset_year, count_val: val_old } = numEntity;

  if (count_reset_year && count_tick.getFullYear() < new Date().getFullYear()) {
    // зарезервированные номера: посчитать и удалить
    const [_, number] = await manager.findAndCountBy(NumCountReserveEntity, {
      num_id: numEntity.id,
    });
    await manager.delete(NumCountReserveEntity, { num_id: numEntity.id });

    // история номеров: записать
    const numCountHistoryEntit = await manager.create(NumCountHistoryEntity, {
      num_id: numEntity.id,
      val: val_old,
      count_reserve: number,
    });
    await manager.save(NumCountHistoryEntity, numCountHistoryEntit);

    // обновить счетчик
    await manager.update(
      NumEntity,
      { id: numEntity.id },
      {
        count_val: 0,
        count_tick: new Date(),
      },
    );

    ret = true;
  }

  return ret;
}