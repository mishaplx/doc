import "dotenv/config";

import { DataSource, DataSourceOptions } from "typeorm";

import { Admin_abonentsEntity } from "../../entity/#adminBase/admin_abonents/admin_abonents.entity";
import { Admin_orgEntity } from "../../entity/#adminBase/admin_org/admin_org.entity";

const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_LOGIN_ADMIN,
  password: process.env.DB_PASS_ADMIN,
  database: 'admin',
  schema: "sad",
  extra: { max: 100, connectionTimeoutMillis: 3000 },
  entities: [Admin_orgEntity, Admin_abonentsEntity],
  synchronize: false,
  cache: true,
  migrationsTableName: "sys_migrations_typeorm_admin",
  migrations: ["dist/database/migration/abonent/*NextAdmin.js"],
};

export const dbConfigDataSourse = new DataSource(dataSourceOptions);
