import "dotenv/config";
import path from "path";
import { DataSource, DataSourceOptions } from "typeorm";

const dataSourceOptions: DataSourceOptions = {
  // name:     ЗДЕСЬ НЕ УКАЗЫВАТЬ
  // database: ЗДЕСЬ НЕ УКАЗЫВАТЬ
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_LOGIN_ADMIN,
  password: process.env.DB_PASS_ADMIN,
  database: process.env.DB_DATABASE_ORG,
  schema: 'sad',
  extra: { max: 100, connectionTimeoutMillis: 300000 },
  cache: true,
  entities: [path.resolve(process.cwd(), "dist/entity/#organization/**/*.entity.js")],
  migrationsTableName: "sys_migrations_typeorm",
  migrations: [
    path.resolve(process.cwd(), "dist/database/migration/org/*Once.js"),
    path.resolve(process.cwd(), "dist/database/migration/org/*Next.js")
  ],
  synchronize: false,
};

export const dbConfigDataSourse = new DataSource(dataSourceOptions);
