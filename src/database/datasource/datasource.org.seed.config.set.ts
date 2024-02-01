import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

import SeedConfigSet from "../seed/config/seed.config.set";
import { dataSourceOptionsOrgHard } from "./datasource.const";

const options: DataSourceOptions & SeederOptions = {
  ...dataSourceOptionsOrgHard,
  entities: [],
  seeds: [SeedConfigSet],
};

export const dataSourceOrgSeedConfigSet = new DataSource(options);
