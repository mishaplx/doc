import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
const fs = require("fs");

import "dotenv/config";
import { CONSOLE } from "../../../app.const";

const pathFiles = [
  "src/database/seed/config/sql/fun/set/fun.set.seq.pgsql",

  "src/database/seed/config/sql/view/set/view.set.doc.pgsql",
  "src/database/seed/config/sql/view/set/view.set.job.pgsql",
  "src/database/seed/config/sql/view/set/view.set.session.pgsql",

  "src/database/seed/config/sql/rls/role/rls.role.set.pgsql",

  "src/database/seed/config/sql/rls/policy/set/rls.policy.set.doc.fun.pgsql",
  "src/database/seed/config/sql/rls/policy/set/rls.policy.set.job.fun.pgsql",
  "src/database/seed/config/sql/rls/policy/set/rls.policy.set.session.fun.pgsql",

  "src/database/seed/config/sql/rls/policy/set/rls.policy.set.project.pgsql",
  "src/database/seed/config/sql/rls/policy/set/rls.policy.set.doc.pgsql",
  "src/database/seed/config/sql/rls/policy/set/rls.policy.set.job.pgsql",
  "src/database/seed/config/sql/rls/policy/set/rls.policy.set.session.pgsql",

  // т.к. миграции генерятся автоматически, то старые очищаем (пока что)
  "src/database/seed/config/sql/migration.pgsql",
];

export default class SeedConfigSet implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    let ret = true;
    for (const pathFile of pathFiles) {
      const sql = fs.readFileSync(pathFile, "utf8");
      try {
        await dataSource.query(sql);
      } catch (err) {
        ret = false;
        console.error("\x1b[31mОШИБКА ВЫПОЛНЕНИЯ ЗАПРОСА:\x1b[0m " + pathFile);
      }
    }
    if (ret) {
      console.log(`${CONSOLE.SEPARATOR}\nНастройка БД: успешно\n${CONSOLE.SEPARATOR}`);
    } else {
      console.error(`${CONSOLE.SEPARATOR}\nНастройка БД: ошибки\n${CONSOLE.SEPARATOR}`);
    }
  }
}
