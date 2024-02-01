import dayjs from "dayjs";
import localeRu from "dayjs/locale/ru";

import { customError } from "src/common/type/errorHelper.type";
import { DocEntity } from "src/entity/#organization/doc/doc.entity";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { NumEntity } from "src/entity/#organization/num/num.entity";
import { Brackets, EntityManager } from "typeorm";
import { takeNumTickUtil } from "../tick/numTick.util";

const ERR = "Параметр нумератора: ошибка ";

/**
 * НУМЕРАТОР: ГЕНЕРИРОВАТЬ НОМЕР
 */
export const runNumGenerateUtil = async (args: {
  manager: EntityManager;
  emp_id: number;
  doc_id: number;
  reserved_counter?: number;
  prepare?: boolean;
}): Promise<string> => {
  const { manager, emp_id, doc_id, reserved_counter, prepare = false } = args;
  let ret = "";

  // Получить документ
  const empEntity = await manager.findOne(EmpEntity, {
    where: {
      id: emp_id,
      del: false,
      temp: false,
    },
  });

  if (!empEntity) {
    customError("Не найден пользователь");
  }

  // Получить документ
  const docEntity = await manager.findOne(DocEntity, {
    where: {
      id: doc_id,
      del: false,
    },
  });
  if (!docEntity) {
    customError("Не найден документ");
  }

  // Получить список нумераторов
  let numEntityList = await manager
    .createQueryBuilder(NumEntity, "Num")
    .leftJoinAndSelect("Num.Kdoc", "Kdoc")
    // .leftJoinAndSelect('Num.Tdocs', 'Tdoc', 'Tdoc.id = :tdoc_id')
    .leftJoinAndSelect("Num.Tdocs", "Tdoc")
    // .leftJoinAndSelect('Num.Units', 'Unit', 'Unit.id = :unit_id')
    .leftJoinAndSelect("Num.Units", "Unit")
    .leftJoinAndSelect("Num.NumParamSel", "NumParamSel")
    .where("Num.kdoc_id = :kdoc_id")
    .andWhere(
      new Brackets((qb) => {
        qb.where("Tdoc.id IS NULL").orWhere(
          new Brackets((qb) => {
            qb.where("Tdoc.del = false").orWhere("Tdoc.id = :tdoc_id");
          }),
        );
      }),
    )
    .andWhere(
      new Brackets((qb) => {
        qb.where("Unit.id IS NULL").orWhere("Unit.id = :unit_id");
      }),
    )
    .andWhere("Num.date_start <= :date_now")
    .andWhere(
      new Brackets((qb) => {
        qb.where("Num.date_end IS NULL").orWhere("Num.date_end > :date_now");
      }),
    )
    .orderBy("NumParamSel.sort", "ASC")
    .setParameters({
      date_now: new Date(),
      kdoc_id: docEntity.cls_id,
      tdoc_id: docEntity.tdoc,
      unit_id: empEntity.unit_id,
    })
    .getMany();

  // Выбрать нумератор: приоритет с видом документа
  let tmp = numEntityList.filter((item) => item.tdoc_ids.includes(docEntity.tdoc));
  if (tmp.length == 0) {
    numEntityList = numEntityList.filter((item) => item.tdoc_ids.length == 0);
  } else {
    numEntityList = tmp;
  }

  // Выбрать нумератор: приоритет с подразделением
  tmp = numEntityList.filter((item) => item.unit_ids.includes(empEntity.unit_id));
  if (tmp.length == 0) {
    numEntityList = numEntityList.filter((item) => item.unit_ids.length == 0);
  } else {
    numEntityList = tmp;
  }

  // Выбрать нумератор
  if (numEntityList.length == 0) {
    customError("Не найден нумератор");
  }
  const numEntity = numEntityList[0];

  // Получить список параметров
  for (const item of await numEntity.NumParamSel) {
    const numParam = await (await item).NumParam;
    switch (numParam.method_name) {
      case "счетчик":
        ret += String(await takeNumTickUtil({
          manager: manager,
          emp_id: emp_id,
          num_id: numEntity.id,
          val: reserved_counter,
          prepare: prepare,
        }));
        break;
      case "строка":
        ret += numParam.method_arg;
        break;
      case "дата":
        ret += await numGenerateParamDate(numParam.method_arg);
        break;
      case "подразделение":
        ret += await numGenerateParamUnit({
          manager: manager,
          emp_id: emp_id,
        });
        break;
      case "ручной ввод":
        ret += item.value
        break;
    }
  }
  return ret;
}


export const numGenerateParamDate = async (arg = "YYYY"): Promise<string> => {
  try {
    return dayjs().locale(localeRu).format(arg);
  } catch (err) {
    return customError(ERR + "даты", err);
  }
};


export const numGenerateParamUnit = async (args: {
  manager: EntityManager;
  emp_id: number;
}): Promise<string> => {
  try {
    const { manager, emp_id } = args;
    const empEntity = await manager.findOneOrFail(EmpEntity, {
      where: { id: emp_id, del: false, temp: false },
      relations: { unit: true },
    });
    const unit = await empEntity.unit;
    return unit.code ?? ("?" as string);
  } catch (err) {
    return customError(ERR + "кода подразделения", err);
  }
};
