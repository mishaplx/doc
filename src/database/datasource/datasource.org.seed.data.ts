import path from "path";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

import "dotenv/config";

import SeedDataOrg from "../seed/data/seed.data.org";
import { dataSourceOptionsOrgHard } from "./datasource.const";

const options: DataSourceOptions & SeederOptions = {
  ...dataSourceOptionsOrgHard,
  entities: [path.resolve(process.cwd(), "src/entity/#organization/**/*.entity.ts")],
  seeds: [SeedDataOrg],
};

export const dataSourceOrgSeedData = new DataSource(options);
