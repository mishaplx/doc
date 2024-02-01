import path from "path";
import process from "process";
import { DataSource, DataSourceOptions } from "typeorm";

const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_LOGIN_ADMIN,
  password: process.env.DB_PASS_ADMIN,
  database: process.env.NAME_DATABASE,
  schema: 'sad',
  entities: [path.resolve(process.cwd(), "dist/entity/org/**/*.entity.js")],
  migrationsTableName: "sys_migrations_typeorm",
  migrations: [path.resolve(process.cwd(), "dist/database/migration/org/*Next.js")],
};

export const dbConfigDataSourse = new DataSource(dataSourceOptions);
