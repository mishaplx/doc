import { Inject, Injectable, Scope } from "@nestjs/common";
import { PubSubEngine } from "graphql-subscriptions";

import { PsBaseCodeEnum, PsBaseEnum, PsEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";
import { PUB_SUB } from "./pubsub.symbols";
import { sendMail } from "src/modules/doc/utils/doc.utils";
import { getDataSourceAdmin } from "src/database/datasource/tenancy/tenancy.utils";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { getSettingsValBool } from "src/modules/settings/settings.util";
import { wLogger } from "src/modules/logger/logging.module";
import { SETTING_CONST } from "src/modules/settings/settings.const";

export type pubBaseType = {
  org: string;
  emp_id?: number;
  session_id?: number;
  msg?: string;
  code?: PsBaseCodeEnum[];
};

/********************************************
 * SERVICE-SINGLETON
 * НАБОР УТИЛИТ
 * !!! НЕ СВЯЗАН С RESOLVER !!!
 ********************************************/
@Injectable({ scope: Scope.DEFAULT })
export class PubSubService {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSubEngine) {}

  /********************************************
   * ОПОВЕЩЕНИЕ: SUCCESS
   ********************************************/
  async pubSuccess(args: pubBaseType): Promise<void> {
    return await this.pubBase({
      ...args,
      msg_type: PsBaseEnum.success,
    });
  }

  /********************************************
   * ОПОВЕЩЕНИЕ: ИНФО
   ********************************************/
  async pubInfo(args: pubBaseType): Promise<void> {
    return await this.pubBase({
      ...args,
      msg_type: PsBaseEnum.info,
    });
  }

  /********************************************
   * ОПОВЕЩЕНИЕ: ПРЕДУПРЕЖДЕНИЕ
   ********************************************/
  async pubWarning(args: pubBaseType): Promise<void> {
    return await this.pubBase({
      ...args,
      msg_type: PsBaseEnum.warning,
    });
  }

  /********************************************
   * ОПОВЕЩЕНИЕ: ERROR
   ********************************************/
  async pubError(args: pubBaseType): Promise<void> {
    return await this.pubBase({
      ...args,
      msg_type: PsBaseEnum.error,
    });
  }

  /********************************************
   * ОПОВЕЩЕНИЕ: SYS
   ********************************************/
  async pubSys(args: pubBaseType): Promise<void> {
    return await this.pubBase({
      ...args,
      msg_type: PsBaseEnum.sys,
    });
  }

  /********************************************
   * СОЗДАТЬ ОПОВЕЩЕНИЕ (БАЗОВЫЙ ВАРИАНТ)
   * @description emp_id ИЛИ session_id, msg ИЛИ code
   ********************************************/
  async pubBase(
    args: pubBaseType & {
      msg_type?: PsBaseEnum;
    },
  ): Promise<void> {
    if ((!args.emp_id && !args.session_id) || (!args.msg && (!args.code || args.code?.length == 0)))
      return;
    args.msg_type = args.msg_type ?? PsBaseEnum.info;

    // дублировать сообщение по электронной почте
    if (args.msg && getSettingsValBool({
      org: args.org,
      key: SETTING_CONST.MSG_EMAIL.nm,
    })) {
      try {
        const dataSource = await getDataSourceAdmin(args.org);
        const staff = await dataSource.manager.createQueryBuilder(EmpEntity, "emp")
          .leftJoin("emp.User", "user", "user.del = false")
          .leftJoin("user.Staff", "staff", "staff.del = false")
          .select("staff.eml as eml")
          .where(`emp.id = ${args.emp_id}`)
          .andWhere('emp.del = false')
          .getRawOne();
        sendMail({
          org: args.org,
          email: staff.eml,
          html: args.msg,
          attachments: [],
          subject: PsBaseEnum.info as string,
        }).catch((err) => wLogger.error(err));
      } catch(err) {
        wLogger.error(err);
      }
    }

    return this.pubSub.publish(PsEnum.base, {
      org: args.org,
      emp_id: args.emp_id,
      session_id: args.session_id,
      [PsEnum.base]: {
        type: args.msg_type ?? PsBaseEnum.info,
        message: args.msg,
        code: args.code,
      },
    });
  }

  /********************************************
   * ОПОВЕЩЕНИЕ: в АДМИН ПАНЕЛИ
   ********************************************/
  async pubAdmin(err = null, stdout): Promise<void> {
    const messasge = stdout.split(/\n/g);
    const obj = {};

    for (let messasgeElement = 0; messasgeElement < messasge.length; messasgeElement++) {
      obj[messasgeElement] = messasge[messasgeElement];
    }
    return this.pubSub.publish(PsEnum.admin, {
      [PsEnum.admin]: { message: JSON.stringify(obj) },
    });
  }
}
