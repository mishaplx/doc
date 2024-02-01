import { DataSourceOptions } from "typeorm";

import "dotenv/config";

export const dsOptionsAdmin: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_LOGIN_ADMIN,
  password: process.env.DB_PASS_ADMIN,
  database: 'admin',
  schema: 'sad',
  synchronize: false,
  logging: true,
} as const;
