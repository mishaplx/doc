import "dotenv/config";

import { Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { exec, execSync } from "child_process";
import process from "process";
import { DataSource, Repository } from "typeorm";

import { OrderCatalogInput } from "../common/argsType/order-catalog-request.dto";
import { OrderCatalogEnum } from "../common/enum/enum";
import { getDataSourceAdmin, getDataSourceServer } from "../database/datasource/tenancy/tenancy.utils";
import { Admin_abonentsEntity } from "../entity/#adminBase/admin_abonents/admin_abonents.entity";
import { Admin_orgEntity } from "../entity/#adminBase/admin_org/admin_org.entity";
import { StaffEntity } from "../entity/#organization/staff/staff.entity";
import { UserEntity } from "../entity/#organization/user/user.entity";
import { listPaginationData } from "../pagination/pagination.service";
import { PaginationInput } from "../pagination/paginationDTO";
import { PubSubService } from "../pubsub/pubsub.service";
import { ADMIN, TEMPLETE } from "./common/admin.const";
import { IAdminDto, responseAdminApi } from "./dto/admin.dto";
import { GetAdminPanelArgs, PaginatedAdminPanelResponse } from "./dto/get-pagination-admin.dto";

@Injectable()
export class AdminService {
  constructor(@Inject(PubSubService) private readonly pubSubService: PubSubService) {}
  private adminAbonent: Repository<Admin_orgEntity>;
  async createOrganization(body: IAdminDto): Promise<responseAdminApi> {
    // const sourceDB = await getDataSourceAdmin(ADMIN);
    const count = await this.isHasTemplateDb();

    if (!count) {
      await this.createTemplateDb();
    }

    await this.launchMigration(TEMPLETE);

    // await this.cloneDB(body.nameDb, sourceDB);
    // await this.launchSeed(body.nameDb);
    //
    // const abonents = await this.writeInfo(body, sourceDB);
    // await this.createUser(abonents, body);
    //
    // await this.launchSettingSet(body.nameDb);
    return {
      error: "",
      success: true,
    };
  }

  // async updateAllOrganization(): Promise<boolean> {
  //   try {
  //     const sourceDB = await getDataSourceAdmin(ADMIN);
  //     const orgForUpdate = await sourceDB.manager.find(Admin_orgEntity, {
  //       // where: {
  //       //   is_sys: false,
  //       //   is_activate: true,
  //       //   //date_deactivate: MoreThan(new Date()) || , //TODO check date_deactivate
  //       // },
  //       where: {
  //         description: "qweqwe",
  //       },
  //     });
  //     orgForUpdate.forEach((organization) => {
  //       this.launchMigration(organization.name);
  //       this.launchSeed(organization.name);
  //     });
  //     return true;
  //   } catch (e) {
  //     throw new Error(e);
  //   }
  // }

  async updateOrganization(organization: string): Promise<boolean> {
    try {
      await this.launchGenerateMigration(organization);
      // await this.launchMigration(organization);
      //await this.launchSeed(organization);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }

  public async deactivateOrganization(id: number): Promise<void> {
    const sourceDB = await getDataSourceAdmin(ADMIN);
    await sourceDB.manager.update(
      Admin_orgEntity,
      { id },
      {
        date_deactivate: new Date(),
      },
    );
  }

  public async activateOrganization(id: number, date_activated: Date): Promise<void> {
    const sourceDB = await getDataSourceAdmin(ADMIN);
    await sourceDB.manager.update(
      Admin_orgEntity,
      { id },
      {
        date_deactivate: null,
        date_activated: date_activated,
      },
    );
  }
  private launchMigration(targetOrganizationName: string): void {
    exec(
      `npm run migration:runAdminPannel --name=${targetOrganizationName}`,
      async (err, stdout) => {
        await this.pubSubService.pubAdmin(err, stdout);
      },
    );

    //execSync(`npm run migration:run --name=${targetOrganizationName}`);
  }
  private async isHasTemplateDb(): Promise<number> {
    const sourceDB = await getDataSourceServer();

    const count = await sourceDB.manager.query(`
         SELECT 1 FROM pg_database WHERE datname = '${TEMPLETE}'`);

    return count.length;
  }

  private async createTemplateDb() {}

  private async launchGenerateMigration(targetOrganizationName: string): Promise<void> {
    execSync(`npm run migration:AdminPanelGenerate --name=${targetOrganizationName}`);
  }

  private async launchSeed(targetOrganizationName: string): Promise<void> {
    execSync(`npm run seed:org --name=${targetOrganizationName}`);
  }

  private async writeDataTo(body: IAdminDto, sourceDB: DataSource): Promise<Admin_abonentsEntity> {
    const orgData = new Admin_orgEntity();
    const abonentsData = new Admin_abonentsEntity();
    orgData.name = body.nameDb;
    orgData.organization = body.nameOrg;
    orgData.is_activate = true;
    orgData.is_sys = false;

    const org = await sourceDB.manager.save(orgData);

    abonentsData.org_id = org.id;
    abonentsData.username = body.loginAdmin;
    abonentsData.dtc = new Date();

    return await sourceDB.manager.save(abonentsData);
  }
  private async cloneDB(targetDatabaseName: string, sourceDB: DataSource): Promise<void> {
    await sourceDB.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${TEMPLETE}'
        AND pid <> pg_backend_pid()`);

    await sourceDB.query(`CREATE DATABASE "${targetDatabaseName}" TEMPLATE ${TEMPLETE}`);

    this.launchSettingSet(targetDatabaseName);
  }
  private async launchSettingSet(targetDatabaseName: string): Promise<void> {
    try {
      execSync(`npm run config:set --name=${targetDatabaseName}`);
    } catch (e) {
      await this.launchSettingDelete(targetDatabaseName);
    }
  }

  private async launchSettingDelete(targetDatabaseName: string): Promise<void> {
    execSync(`npm run config:del --name=${targetDatabaseName}`);
  }
  private async createUser(abonent: Admin_abonentsEntity, body: IAdminDto): Promise<void> {
    const salt = bcrypt.genSaltSync(Number(process.env.JWT_SALT));
    const passwordHash = await bcrypt.hash(body.passwordAdmin, salt);

    const sourceDB = await getDataSourceAdmin(body.nameDb);
    await sourceDB.manager.update(
      UserEntity,
      { id: 1 }, // т.к. Уже прошли сиды и это первый пользователь в новой базе данных
      {
        main_id: abonent.id,
        password: passwordHash,
        salt: salt,
        username: body.loginAdmin,
      },
    );

    await sourceDB.manager.update(
      StaffEntity,
      { id: 1 }, // т.к. Уже прошли сиды и это первый пользователь в новой базе данных
      {
        nm: ADMIN,
        ln: ADMIN,
        mn: ADMIN,
      },
    );
  }

  async getOrganizations(
    args: GetAdminPanelArgs,
    pagination: PaginationInput,
    orderBy: OrderCatalogInput,
  ): Promise<PaginatedAdminPanelResponse> {
    const sourceDB = await getDataSourceAdmin(ADMIN);
    args.is_sys = false;
    this.adminAbonent = sourceDB.getRepository(Admin_orgEntity);
    const order = orderBy?.value === OrderCatalogEnum.nm ? { nm: orderBy.sortEnum } : null;
    return await listPaginationData({
      repository: this.adminAbonent,
      pagination: pagination,
      order: order ?? { id: "DESC" },
      filter: args,
    });
  }
}
