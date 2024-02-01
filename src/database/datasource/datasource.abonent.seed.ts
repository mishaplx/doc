import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

import "dotenv/config";

import { Admin_abonentsEntity } from "../../entity/#adminBase/admin_abonents/admin_abonents.entity";
import { dsOptionsAdmin } from "./dsoptions.admin";
import SeedDataAbonent from "../seed/data/seed.data.abonent";

const options: DataSourceOptions & SeederOptions = {
  ...dsOptionsAdmin,
  entities: [Admin_abonentsEntity],
  seeds: [SeedDataAbonent],
};

export const dataSource = new DataSource(options);
