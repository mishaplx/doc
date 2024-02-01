import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

import SeedConfigDel from "../seed/config/seed.config.del";
import { dataSourceOptionsOrgHard } from "./datasource.const";

const options: DataSourceOptions & SeederOptions = {
  ...dataSourceOptionsOrgHard,
  entities: [],
  seeds: [SeedConfigDel],
};

export const dataSourceOrgSeedConfigDel = new DataSource(options);
