import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { getDataSourceAdmin } from "../database/datasource/tenancy/tenancy.utils";
import { Admin_orgEntity } from "../entity/#adminBase/admin_org/admin_org.entity";
import { ADMIN } from "./common/admin.const";

@Injectable()
export class ActiveService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronActivateOrganization() {
    const sourceConnection = await getDataSourceAdmin(ADMIN);

    const recordsToUpdate =
      await sourceConnection.query(`select name from sad.admin_org where admin_org.is_sys = false AND
                                       (admin_org.date_activated <= current_date AND
                                       admin_org.date_deactivate >= current_date OR admin_org.date_deactivate is null)`);
    for (const record of recordsToUpdate) {
      await sourceConnection
        .getRepository(Admin_orgEntity)
        .update(record.id, { is_activate: false });
    }

    console.log("Обновление завершено.");
  }
}
