import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
const fs = require("fs");

import "dotenv/config";
import { CONSOLE } from "../../../app.const";

const pathFiles = [
  "src/database/seed/config/sql/rls/policy/del/rls.policy.del.session.pgsql",
  "src/database/seed/config/sql/rls/policy/del/rls.policy.del.project.pgsql",
  "src/database/seed/config/sql/rls/policy/del/rls.policy.del.doc.pgsql",
  "src/database/seed/config/sql/rls/policy/del/rls.policy.del.job.pgsql",

  "src/database/seed/config/sql/rls/policy/del/rls.policy.del.doc.fun.pgsql",
  "src/database/seed/config/sql/rls/policy/del/rls.policy.del.job.fun.pgsql",
  "src/database/seed/config/sql/rls/policy/del/rls.policy.del.session.fun.pgsql",

  // УДАЛЯТЬ РОЛИ НЕ РЕКОМЕНДУЕТСЯ (роль может использоваться в других БД)
  // "src/database/seed/config/sql/rls/role/rls.role.del.pgsql",

  "src/database/seed/config/sql/view/del/view.del.session.pgsql",
  "src/database/seed/config/sql/view/del/view.del.doc.pgsql",
  "src/database/seed/config/sql/view/del/view.del.job.pgsql",

  "src/database/seed/config/sql/fun/del/fun.del.seq.pgsql",
];

export default class SeedConfigDel implements Seeder {
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
      console.log(`${CONSOLE.SEPARATOR}\nОткат настройки БД: успешно\n${CONSOLE.SEPARATOR}`);
    } else {
      console.error(`${CONSOLE.SEPARATOR}\nОткат настройки БД: ошибки\n${CONSOLE.SEPARATOR}\n`);
    }
  }
}
