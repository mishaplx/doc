import { AbstractLogger, DataSourceOptions, LogLevel, LogMessage } from "typeorm"
import { SeederOptions } from "typeorm-extension";
import winston from "winston";

import "dotenv/config";

import { initWinston } from "../../modules/logger/logging.module";
import { LOGGER } from "../../app.const";

/**
 * НАСТРОЙКИ: ОБЩИЕ ДЛЯ ВСЕХ БАЗ
 */
export const dataSourceOptionsBase = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  synchronize: false,
  schema: 'sad',
  // timezone:
} as const;


/**
 * НАСТРОЙКИ: БД АБОНЕНТЫ
 */
export const dataSourceOptionsAbonent = {
  ...dataSourceOptionsBase,
  migrationsTableName: "sys_migration_typeorm_admin",
  // cache: true,
}  as const;


/**
 * НАСТРОЙКИ: БД ORG
 */
export const dataSourceOptionsOrg = {
  ...dataSourceOptionsBase,
  migrationsTableName: "sys_migration_typeorm",
  extra: { max: 100, connectionTimeoutMillis: 300000 },
  // cache: false,
}  as const;


/**
 * ЛОГГЕР СИДОВ
 */
class LoggerSeed extends AbstractLogger {
  private readonly wLogger: winston.Logger;
  constructor() {
    super();
    this.wLogger = initWinston(LOGGER.TITLE);
  }

  protected writeLog(level: LogLevel, message: string | number | LogMessage | (string | number | LogMessage)[]): void {
    this.wLogger.log(level, message);
  }

  logQuery(query: string): void { this.wLogger.info(query); };
  logQueryError(error: string, query: string): void { this.wLogger.error(query+'\n'+error); };
  logSchemaBuild(message: string): void { this.wLogger.info(message); };
  logMigration(message: string): void { this.wLogger.info(message); };
}


/**
 * НАСТРОЙКИ: СИДЫ
 */
export const dataSourceOptionsSeed = {
  logging: true,
  logger: new LoggerSeed(), // "file",
}  as const;


/**
 * FIXME: ХАРДКОД, УДАЛИТЬ
 */
export const dataSourceOptionsOrgHard: DataSourceOptions & SeederOptions = {
  ...dataSourceOptionsOrg,
  ...dataSourceOptionsSeed,
  database: process.env.NAME_DATABASE,
  username: process.env.DB_LOGIN_ADMIN,
  password: process.env.DB_PASS_ADMIN,
}  as const;

