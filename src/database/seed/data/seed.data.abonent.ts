import { DataSource, In, Not, Repository } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

import { Admin_abonentsEntity } from "../../../entity/#adminBase/admin_abonents/admin_abonents.entity";
import { AbonentsDefaultArr } from "./default/adminDefault";
import { hashPassword } from "./seed.data.util";

export default class SeedDataAbonent implements Seeder {
  private async updateDataAdmin(
    repository: Repository<any>,
    arr: Array<any>,
    checkUser = 0,
  ): Promise<void> {
    if (checkUser) {
      const userCred = await hashPassword();
      arr[0].username = userCred.username;
      arr[0].password = userCred.password;
    } else {
      const arrId = Not(In(arr.map((el) => el.id)));
      await repository.update(
        { id: arrId },
        {
          del: true,
        },
      );
    }
    await repository.save(arr);
  }

  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const repositoryAbonent = dataSource.getRepository(Admin_abonentsEntity);
    await this.updateDataAdmin(repositoryAbonent, AbonentsDefaultArr, 1);
  }
}
