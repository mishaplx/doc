import "dotenv/config";

import path from "path";
import { DataSource, DataSourceOptions } from "typeorm";

import { Admin_abonentsEntity } from "../../../entity/#adminBase/admin_abonents/admin_abonents.entity";
import { Admin_orgEntity } from "../../../entity/#adminBase/admin_org/admin_org.entity";
import { customError } from "../../../common/type/errorHelper.type";
import { dataSourceOptionsBase } from "../datasource.const";

export enum DsConnectTypes {
  /** Администратор */
  ADMIN = 1,
  /** Пользователь */
  RLS = 2,
}

/**
 * СПИСОК НАЗВАНИЙ БАЗ ДАННЫХ
 */
export const getOrgList = async (): Promise<string[]> => {
  let ret = [];
  try {
    const dataSourceAdmin = await getDataSourceAbonents();
    const abonentsorgRepository = dataSourceAdmin.manager.getRepository(Admin_orgEntity);
    const qb = await abonentsorgRepository
      .createQueryBuilder("org")
      .select("name")
      .where("is_sys = false AND is_activate = true")
      .orderBy("name", "ASC")
      .getRawMany();
    ret = qb.map((item) => item.name);
  } finally {
    return ret;
  }
};


/**
 * ПОЛУЧИТЬ СОЕДИНЕНИЕ С ЛОКАЛЬНОЙ БД
 * НЕ АДМИН: С ПОЛИТИКОЙ RLS, ИНАЧЕ: КАК ADMIN
 * @param args.org - наименование БД
 * @param args.emp_id - назначение, если не задан -1
 */
export async function getDataSourceCorrect(args: {
  org: string;
  emp_id?: number;
}): Promise<DataSource> {
  try{
    const { org, emp_id = -1 } = args;

    // получить соединение c RLS политикой
    const ds_rls = await getDataSourceLocal({
      org: org,
      connect_type: DsConnectTypes.RLS,
    });

    // проверить админ ли
    let is_admin = false;
    if (emp_id > 0) {
      const rec = await ds_rls.query(`
        select is_admin
        from sad.emp
        where id = '${emp_id}';
      `);
      is_admin = rec[0].is_admin;
    }

    // если не админ: нет права на работу без RLS
    if (!is_admin) {
      // установить переменную соединения для RLS
      await ds_rls.query(`set session "rls.emp_id" = '${emp_id}';`);
      // вернуть соединение с RLS политикой
      return ds_rls;
    }

    // получить соединение без RLS политики
    const ds_admin = await getDataSourceAdmin(org);

    // сбросить переменную соединения для RLS (убрать следы предыдущего сеанса)
    await ds_admin.query(`reset "rls.emp_id";`);

    // вернуть соединение без RLS политики
    return ds_admin;
  } catch (err) {
    customError("Ошибка подключения к базе данных", err);
  }
}


const dataSourceList: DataSource[] = [];

/**
 * ПОЛУЧИТЬ СОЕДИНЕНИЕ С ЛОКАЛЬНОЙ БД
 * !!! ТОЛЬКО СОЕДИНЕНИЕ БЕЗ НАСТРОЕННОЙ RLS !!!
 * !!! emp_id для RLS НЕ УСТАНАВЛИВАЕТСЯ !!!
 * не делать export
 * @param args.org - наименование БД
 * @param args.connect_type - тип соединения: админ (без RLS) или пользователь (с RLS)
 */
async function getDataSourceLocal(args: {
  org: string;
  connect_type?: DsConnectTypes;
}): Promise<DataSource> {
  const { org, connect_type = DsConnectTypes.RLS } = args;
  const ds_name = org + "_<" + connect_type + ">";

  // FIXME: УДАЛИТЬ Т.К. ORG ПРИХОДИТ UNDEFINED ВСЛЕДСТВИЕ ДРУГОЙ ПРОБЛЕМЫ
  if (!org) return;

  if (!dataSourceList[ds_name]?.isInitialized) {
    const config: DataSourceOptions = {
      ...dataSourceOptionsBase,
      name: org,
      username:
        connect_type == DsConnectTypes.ADMIN
          ? process.env.DB_LOGIN_ADMIN
          : process.env.DB_LOGIN_RLS,
      password:
        connect_type == DsConnectTypes.ADMIN
          ? process.env.DB_PASS_ADMIN
          : process.env.DB_PASS_RLS,
      database: org,
      extra: {
        max: 100,
        connectionTimeoutMillis: 300000,
      },
      cache: {
        tableName: `${process.env.DB_TABLE_CACHE}`,
      },
      entities: [path.resolve(process.cwd(), "dist/**/*.entity.js")],
    };

    dataSourceList[ds_name] = new DataSource(config);
    await dataSourceList[ds_name]
      .initialize()
      .then(() => {
        console.log('Data Source "' + ds_name + '" has been initialized!');
      })
      .catch((err) => {
        console.error('Data Source "' + ds_name + '" error initialization', err);
      });
  }

  return dataSourceList[ds_name];
}

/**
 * ПОЛУЧИТЬ ADMIN-СОЕДИНЕНИЕ С ЛОКАЛЬНОЙ БД
 * @param org - наименование БД
 */
export const getDataSourceAdmin = async (org: string): Promise<DataSource> =>
  await getDataSourceLocal({
    org: org,
    connect_type: DsConnectTypes.ADMIN,
  });

/**
 * ПОЛУЧИТЬ СОЕДИНЕНИЕ С БД АБОНЕНТОВ
 */
export const getDataSourceAbonents = async (): Promise<DataSource> => {
  const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_LOGIN_ADMIN,
    password: process.env.DB_PASS_ADMIN,
    database: process.env.DB_DATABASE_ADMIN,
    logging: false,
    entities: [Admin_abonentsEntity, Admin_orgEntity], //path.resolve(process.cwd(), "src/entity/#adminBase/**/*.entity.ts"
  });
  await AppDataSource.initialize();
  return AppDataSource;
};

export const getDataSourceServer = async (): Promise<DataSource> => {
  const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_LOGIN_ADMIN,
    password: process.env.DB_PASS_ADMIN,
    logging: false,
  });
  await AppDataSource.initialize();
  return AppDataSource;
};
