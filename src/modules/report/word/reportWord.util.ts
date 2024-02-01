import dayjs from "dayjs";
import localeRu from "dayjs/locale/ru";
import Docxtemplater from "docxtemplater";
import { Readable } from "stream";

const fs = require("fs"),
  PizZip = require("pizzip");

import { DataSource } from "typeorm";
import { ArticleEntity } from "../../../entity/#organization/article/article.entity";
import { CorrespondentEntity } from "../../../entity/#organization/correspondent/correspondent.entity";
import { DeliveryEntity } from "../../../entity/#organization/delivery/delivery.entity";
import { KdocEntity } from "../../../entity/#organization/doc/kdoc.entity";
import { TdocEntity } from "../../../entity/#organization/doc/tdoc.entity";
import { EmpEntity } from "../../../entity/#organization/emp/emp.entity";
import { EmpReplaceEntity } from "../../../entity/#organization/emp_replace/emp_replace.entity";
import { ExecInprojectRouteEntity } from "../../../entity/#organization/project/execInprojectRoute.entity";
import { JobsControlTypesEntity } from "../../../entity/#organization/job/jobControlTypes.entity";
import { NomenclaturesEntity } from "../../../entity/#organization/nomenclatures/nomenclatures.entity";
import { NumEntity } from "../../../entity/#organization/num/num.entity";
import { OrgEntity } from "../../../entity/#organization/org/org.entity";
import { PostEntity } from "../../../entity/#organization/post/post.entity";
import { PrivEntity } from "../../../entity/#organization/priv/priv.entity";
import { ProjectEntity } from "../../../entity/#organization/project/project.entity";
import { RegionEntity } from "../../../entity/#organization/region/region.entity";
import { RelTypesEntity } from "../../../entity/#organization/rel/relTypes.entity";
import { RolesEntity } from "../../../entity/#organization/role/role.entity";
import { SettingEntity } from "../../../entity/#organization/setting/setting.entity";
import { SmdoAbonentsEntity } from "../../../entity/#organization/smdo/smdo_abonents.entity";
import { StaffEntity } from "../../../entity/#organization/staff/staff.entity";
import { TemplateRouteProjectEntity } from "../../../entity/#organization/templateRouteProject/template_route_project.entity";
import { TermEntity } from "../../../entity/#organization/term/term.entity";
import { TypeJobEntity } from "../../../entity/#organization/typeJob/typeJob.entity";
import { UnitEntity } from "../../../entity/#organization/unit/unit.entity";
import { UserEntity } from "../../../entity/#organization/user/user.entity";
import { streamToBuffer } from "../../file/utils/file.common.utils";
import { onlyUpFirst, toUpFirst } from "src/common/utils/utils.text";

export interface IDocxTemplate {
  path?: string;
  stream?: Readable;
  buffer?: Buffer;
}

const STR_EMPTY = "";

/********************************************
 * ОБРАБОТЧИК
 ********************************************/
export const docxOrg = async (args: {
  template: IDocxTemplate;
  data: any;
  dataSource: DataSource; // нужно для чтения props
  cb: (buffer: any) => any;
}): Promise<any> => {
  const { template, data, dataSource, cb } = args;

  // открыть файл шаблона
  const file_ref = await docxIni({
    template: template,
    cb_parser: (tag) => ({
      get: async (scope, context) => {
        if (tag === "$index") {
          const indexes = context.scopePathItem;
          return indexes[indexes.length - 1] + 1;
        }
        // не допускать при отсутствии ключа его поиск в родительском объекте
        // работает и без этого, предусмотрено в парсере
        // if (context.num < context.scopePath.length) return null;

        // распарсить
        return await docxParser({
          obj: scope,
          actions: tag,
          dataSource: dataSource,
        });
      },
    }),
  });

  // ТОЛЬКО АСИНХРОННО так как нужно извлекать промисы
  return file_ref.renderAsync(data).then(() => {
    // данные в буфер
    const file_buf = file_ref.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE", // сжимать итоговый файл
    });

    // вызвать callback синхронно
    return cb(file_buf);
  });
};

/********************************************
 * ОТКРЫТЬ DOC-ФАЙЛ ШАБЛОНА ОТЧЕТА
 * https://docxtemplater.com/docs/configuration/
 * https://docxtemplater.com/docs/async/
 ********************************************/
const docxIni = async (args: {
  template: IDocxTemplate;
  cb_parser?: (tag: string) => {
    get: (scope: any, context: any) => any;
  };
}): Promise<Docxtemplater> => {
  const { template, cb_parser } = args;

  let bufferFile: Buffer;
  if (template.path) bufferFile = fs.readFileSync(template.path);
  else if (template.stream) bufferFile = await streamToBuffer(template.stream);
  else if (template.buffer) bufferFile = template.buffer;
  else throw new Error("Не задан шаблон");

  const streamZip = new PizZip(bufferFile);
  return new Docxtemplater(streamZip, {
    // собственный парсер
    parser: cb_parser,
    // не показывать null и undefined значения
    nullGetter: function () {
      return "";
    },
    // при вставке \n отображать разрыв строки
    linebreaks: true,
    // без дополнительных пустых строк (абзацы без дополнительных интервалов)
    paragraphLoop: true,
  });
};

/********************************************
 * НАЙТИ ЗНАЧЕНИЕ ПО ЦЕПОЧКЕ КЛЮЧЕЙ
 * @param obj = {key1: val, key2: [{name: '11'}, {name: '22'}]}
 * @param actions = 'doc.Author.Org.nm.space' - последовательность команд
 ********************************************/
const docxParser = async (args: {
  obj: any;
  actions: string;
  dataSource: DataSource;
}): Promise<any> => {
  let { obj, actions } = args;
  const { dataSource } = args;
  const re_props = new RegExp("props\\((.+?)\\)", "i");
  const re_filter = new RegExp("filter\\(\\s*(.*?)\\s*,\\s*(.*?)\\s*\\)", "i");
  const re_sort = new RegExp("sort\\(\\s*(.*?)\\s*\\)", "i");
  const re_fio = new RegExp("fio\\((.+?)\\)", "i");
  const re_if = new RegExp("if\\((.*?)\\)", "i");
  const re_dt = new RegExp("dateformat\\((.+?)\\)", "i");
  const re_text = new RegExp("text\\((.+?)\\)", "i");
  const re_prefix = new RegExp("prefix\\((.+?)\\)", "i");
  const re_postfix = new RegExp("postfix\\((.+?)\\)", "i");
  const PARSER_SORT_VALUES = 'TEMP_PARSER_SORT_VALUES';

  const obj_copy = obj;
  actions = actions.replace(/\[(\w+)\]/g, ".$1"); // индекс в свойство
  actions = actions.replace(/^\./, ""); // отрезать точку в начале

  // заменить в datetime(mm.dd) точку на SIGN
  const SIGN = "<ITSIGNIT>";
  actions = actions
    .replace(re_props, (match) => match.replaceAll(".", SIGN))
    .replace(re_filter, (match) => match.replaceAll(".", SIGN))
    .replace(re_sort, (match) => match.replaceAll(".", SIGN))
    .replace(re_fio, (match) => match.replaceAll(".", SIGN))
    .replace(re_if, (match) => match.replaceAll(".", SIGN))
    .replace(re_dt, (match) => match.replaceAll(".", SIGN))
    .replace(re_text, (match) => match.replaceAll(".", SIGN))
    .replace(re_prefix, (match) => match.replaceAll(".", SIGN))
    .replace(re_postfix, (match) => match.replaceAll(".", SIGN));

  const actions_list = actions.split(".");
  for (let i = 0, n = actions_list.length; i < n; ++i) {
    const action = actions_list[i];
    const action_lower = action.toLowerCase();
    const obj_empty = [undefined, null, STR_EMPTY].includes(obj);

    /********************************
     * OBJ: FILTER
     ********************************/
    // команда: фильтровать список объектов
    if (action.match(re_filter) && Array.isArray(obj)) {
      const filter_val = action.match(re_filter);
      const filter_val_1 = filter_val.at(1)?.replaceAll(SIGN, ".");
      const filter_val_2 = filter_val.at(2)?.replaceAll(SIGN, ".");
      for (let i = obj.length - 1; i >= 0; i--) {
        const val = await docxParser({
          obj: obj[i],
          actions: filter_val_1,
          dataSource: dataSource,
        });
        if (val != filter_val_2) {
          obj.splice(i, 1);
        }
      }
      continue;
    }

    /********************************
     * OBJ: SORT
     ********************************/
    // команда: сортировать список объектов
    // параметры: пары ключ, направление сортировки (ASC,DESC)
    // допустима сортировка по нескольким параметрам
    // ключи сортировки могут быть распаршены
    if (action.match(re_sort) && Array.isArray(obj)) {
      // список параметров функции SORT
      const sort_param_orig =
        action
        .match(re_sort)
        ?.at(1)
        ?.replaceAll(SIGN, ".")
        ?.split(",")
        ?.map(x => x.trim());

      // разбить [{key: i, asc: i+1}, ...]
      const sort_param: {key: any, asc: boolean}[] = [];
      for(let i=0; i<sort_param_orig.length; i+=2) {
        sort_param.push({
          key: sort_param_orig[i],
          asc: sort_param_orig[i+1]?.toUpperCase()== 'ASC',
        });
      }

      // распарсить ключи в объектах, по которым будет проводиться сортировка
      for (const obj_item of obj) {
        const param = [];
        for (const sort_param_item of sort_param) {
          const val = await docxParser({
            obj: obj_item,
            actions: sort_param_item.key,
            dataSource: dataSource,
          })
          param.push(val);
        }
        obj_item[PARSER_SORT_VALUES] = param;
      }

      // непосредственно сортировка по всем параметрам
      obj.sort((a, b) => {
        let ret = 0;
        for (let param_ind=0; param_ind<sort_param.length; param_ind++) {
          const param_asc = sort_param[param_ind].asc;
          let val_a = a[PARSER_SORT_VALUES]?.[param_ind];
          let val_b = b[PARSER_SORT_VALUES]?.[param_ind];
          // if (val_a instanceof Date) val_a = new Date(val_a);
          // if (val_b instanceof Date) val_b = new Date(val_b);
          ret = param_asc ? val_a - val_b : val_b - val_a;
          if (ret != 0) break;
        }
        return ret;
      });

      // удалить временный ключ
      obj.map(x => delete x[PARSER_SORT_VALUES]);
      continue;
    }

    /********************************
     * OBJ: COUNT
     ********************************/
    // команда: количество объектов
    if (action_lower === "count()" && Array.isArray(obj)) {
      obj = obj.length;
      continue;
    }

    /********************************
     * OBJ: ОБЪЕКТ
     ********************************/
    // команда: читать ключ action из объекта obj
    // obj - объект и в нем есть ключ action
    if (obj === Object(obj) && action in obj) {
      obj = await obj[action];
      // отсутствие значения недопустимо, так при вложенности {#...}{/...} ищет в родительском объекте
      // удаленные или временные объекты пропустить
      if (
        [undefined, null].includes(obj) ||
        !checkVisible(obj)
        // (obj?.temp ?? false) ||
        // (obj?.del ?? false)
      )
        obj = STR_EMPTY;
      if (Array.isArray(obj)) {
        obj = obj.filter((item) => !((item?.temp ?? false) || (item?.del ?? false)));
      }
      continue;

      /********************************
       * OBJ: ОБЪЕКТ STAFF
       ********************************/
      // команда: fio(...)
    } else if (action.match(re_fio) && obj === Object(obj)) {
      const fio_val = action.match(re_fio)?.at(1)?.replaceAll(SIGN, ".");
      switch (fio_val) {
        case "short":
          // сформировать строку: фамилия инициалы
          // пример: 'Иванов И.И.'
          obj = (
            toUpFirst({ str: obj.ln, postfix: ' ' }) +
            onlyUpFirst({ str: obj.nm, postfix: '.' }) +
            onlyUpFirst({ str: obj.mn, postfix: '.' })
          ).trim();
          break;

        case "short_rev":
          // сформировать строку: инициалы фамилия
          // пример: 'И.И.Иванов'
          obj = (
            onlyUpFirst({ str: obj.nm, postfix: '.' }) +
            onlyUpFirst({ str: obj.mn, postfix: '.' }) +
            toUpFirst({ str: obj.ln })
          ).trim();
          break;

        case "full":
        default:
          // сформировать строку: фамилия имя отчество
          // пример: 'Иванов Иван Иванович'
          obj = (
              toUpFirst({ str: obj.ln, postfix: ' ' }) +
              toUpFirst({ str: obj.nm, postfix: ' ' }) +
              toUpFirst({ str: obj.mn })
          ).trim();
          break;
      }
      continue;

      /********************************
       * OBJ: СТРОКА
       ********************************/
      // команда: props(val)
      // установить значение строки в setting.val
    } else if (action.match(re_props)) {
      const props_val = action.match(re_props)?.at(1)?.replaceAll(SIGN, ".");
      const dd = await dataSource.manager.findOneBy(SettingEntity, {
        name: props_val,
        props: true,
        del: false,
      });
      obj = dd ? dd.value : "<ОШИБКА: НЕ НАЙДЕН РЕКВИЗИТ " + props_val + ">";
      continue;

      // команда: text(val)
      // установить значение строки в val
      // //n -> /n для обеспечения переноса строки
    } else if (action.match(re_text)) {
      // && typeof obj == 'string' && obj != ''
      const text_val = action.match(re_text)?.at(1)?.replaceAll(SIGN, ".").replaceAll("\\n", "\n");
      obj = text_val;
      continue;

      // команда: prefix(val)
      // добавить val перед строкой если строка НЕ ПУСТАЯ
    } else if (action.match(re_prefix) && typeof obj == "string" && obj != "") {
      const prefix_val = action.match(re_prefix)?.at(1)?.replaceAll(SIGN, ".");
      obj = prefix_val + obj;
      continue;

      // команда: postfix(val)
      // добавить val после строки если строка НЕ ПУСТАЯ
    } else if (action.match(re_postfix) && typeof obj == "string" && obj != "") {
      const postfix_val = action.match(re_postfix)?.at(1)?.replaceAll(SIGN, ".");
      obj = obj + postfix_val;
      continue;

      // команда: space()
      // добавить пробел если строка НЕ ПУСТАЯ
    } else if (action_lower === "space()" && typeof obj == "string" && obj != "") {
      obj += " ";
      continue;

      // команда: trim()
      // обрезать по краям пробелы
    } else if (action_lower === "trim()" && typeof obj == "string") {
      obj = obj.trim();
      continue;

      // команда: upper()
      // все символы в заглавные
    } else if (action_lower === "upper()" && typeof obj == "string") {
      obj = obj.toUpperCase();
      continue;

      // команда: lower()
      // все символы в строчные
    } else if (action_lower === "lower()" && typeof obj == "string") {
      obj = obj.toLowerCase();
      continue;

      /********************************
       * OBJ / СТРОКА: ДАТА/ВРЕМЯ
       ********************************/
      // команда: dateformat(...)
      // формат даты/времени
      // пример: dateformat(DD.MM-YYYY) => '01.01-2000'
    } else if (action.match(re_dt) && ["object", "string"].includes(typeof obj)) {
      const dt_val = action.match(re_dt)?.at(1)?.replaceAll(SIGN, ".");
      obj = [undefined, null, ""].includes(obj)
        ? "" // недопустимо null или undefined - шаблонизатор пытается найти ключ в родительском объекте
        : dayjs(obj).locale(localeRu).format(dt_val);
      continue;

      /********************************
       * IF
       ********************************/
      // команда: if(...) / IF(...)
      // if(val): val = obj.toString() - продолжить
      // if(): obj == [undefined, null] - продолжить
      // ранее было: if(null): val = null и obj == [undefined, null] - продолжить
      // if(not_null): val = not_null и obj != [undefined, null] - продолжить
      // иначе - прекратить и вернуть пустую строку
      // после if в продолжение допускается начать просмотр объекта с начала
      // пример: {is_responsible.if(true). (свод)}
      // пример: {is_responsible.if(true).Controller.User.dtc.dateformat.DD*MM*YYYY}
      // пример: {job.Doc.if(not_null).reg_num.prefix(к № )}
    } else if (action.match(re_if)) {
      const if_val = action.match(re_if)?.at(1)?.replaceAll(SIGN, ".");
      // если условие не соблюдено: прервать цепочку
      if (
        (if_val == "null" && !obj_empty) ||
        (if_val == "not_null" && obj_empty) ||
        !["null", "not_null", obj.toString()].includes(if_val)
      )
        return "";
      // для null и not_null - продолжить перемещение по цепочке команд
      // если сравнивается текст и нет дальше команд - результат
      if (
        (["null", "not_null"].includes(if_val) &&
          obj === Object(obj) &&
          actions_list[i + 1] in obj) ||
        (obj.toString() == if_val && actions_list.length - 1 == i)
      )
        continue;

      // иначе или начинаем цепочку сначала или ставим команду как текущее значение
      i += 1;
      obj =
        obj_copy === Object(obj_copy) && actions_list.at(i) in obj_copy
          ? await obj_copy[actions_list[i]]
          : actions_list[i];
      continue;

      // // если следующий объект: начинаем цепочку сначала
      // if (obj = (obj_copy === Object(obj_copy) && actions_list.at(i+1) in obj_copy)) {
      //   i += 1;
      //   obj = await obj_copy[actions_list[i]];
      //   // continue;
      // }

      // /********************************
      //  * NOT
      //  ********************************/
      // // инвертировать значение
      // } else if (action_lower === 'not()') {
      //   obj = !(obj);

      /********************************
       * OBJ:
       ********************************/

      // значения нет -> ''
    } else if (obj_empty || Object.values(obj)?.length == 0) {
      obj = STR_EMPTY;

      // ни один обработчик не сработал
    } else {
      //return obj;
      return ("<ОШИБКА: " + actions + " -> " + action + ">").replaceAll(SIGN, ".");
    }
  }
  return obj;
};

/********************************************
 * ПОКАЗЫВАТЬ ЛИ ВРЕМЕННЫЙ ИЛИ УДАЛЕННЫЙ ОБЪЕКТ
 ********************************************/
const checkVisible = (obj: any): boolean => {
  // временные объекты не показывать
  if (obj?.temp ?? false) return false;

  // удаленные объекты показывать если они есть в списке
  if (obj?.del ?? false) {
    for (const item of [
      OrgEntity,
      PostEntity,
      EmpEntity,
      TdocEntity,
      TypeJobEntity,
      ArticleEntity,
      EmpReplaceEntity,
      ArticleEntity,
      RelTypesEntity,
      NumEntity,
      RolesEntity,
      UserEntity,
      StaffEntity,
      KdocEntity,
      JobsControlTypesEntity,
      TermEntity,
      NomenclaturesEntity,
      UnitEntity,
      DeliveryEntity,
      SmdoAbonentsEntity,
      TemplateRouteProjectEntity,
      RegionEntity,
      PrivEntity,
      CorrespondentEntity,
      ProjectEntity,
      ExecInprojectRouteEntity,
    ]) {
      if (obj instanceof item) return true;
    }
    return false;
  }

  // если признаков удаления и временного объекта нет - показать
  return true;
};

// /********************************************
//  * ПРОМИСС В ЗНАЧЕНИЕ (РЕКУРСИЯ)
//  * @param level = количество интераций
//  ********************************************/
// export const reportPromiseToValue = (args: {
//   entity: any,
//   level?: number,
// }): any => {
//   const { entity, level = 4 } = args;
//   const re = new RegExp("__(.*)__", "s");

//   let ret = {...entity}
//   if (level > 0) {
//     const keys = Object.keys(ret);
//     if (keys?.at(0) == '0') {
//       // для псевдо-списка: '0', '1', ...
//       const lst = [];
//       for (const key of keys) {
//         const tt = reportPromiseToValue({
//           entity: ret[key],
//           level: level - 1,
//         });
//         lst.push(tt);
//       }
//       // for (let i=0; i<ret.length; i++) {
//       //   // ret[i] = reportPromiseToValue(ret[i], level - 1);
//       //   const tt = reportPromiseToValue(ret[i], level - 1);
//       //   lst.push(tt);
//       // }
//       ret = lst;
//     } else {
//       // для словаря-объекта
//       for (const key of keys) {
//         if (!isNaN(+key)) {
//           ret[key] = reportPromiseToValue({
//             entity: ret[key],
//             level: level - 1,
//           });
//           continue;
//         }
//         const found = key.match(re);
//         if (found) {
//           ret[found[1]] = reportPromiseToValue({
//             entity: ret[key],
//             level: level - 1,
//           });
//           delete ret[key];
//         }
//       }
//     }
//   }
//   return ret;
// }
