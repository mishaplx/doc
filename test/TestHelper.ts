import path from "path";
import { dataSourceOptionsOrg } from "src/database/datasource/datasource.const";
import { DataSource, DataSourceOptions } from "typeorm";

export class TestHelper {
  private static _instance: TestHelper;

  public static get instance(): TestHelper {
    if (!this._instance) this._instance = new TestHelper();
    return this._instance;
  }

  public dbConnect!: DataSource;

  async setupTestDB() {
    const entities = [path.resolve(process.cwd(), "src/**/*.entity.ts")];
    const config: DataSourceOptions = {
      ...dataSourceOptionsOrg,
      // name: "docnodebelaz6",
      username: process.env.DB_LOGIN_ADMIN,
      password: process.env.DB_PASS_ADMIN,
      database: "docnodebelaz6",
      cache: {
        tableName: `${process.env.DB_TABLE_CACHE}`,
      },
      entities,
    };
    const dataSource = new DataSource(config);
    this.dbConnect = await dataSource.initialize();
  }

  teardownTestDB() {
    this.dbConnect.destroy();
  }
}
