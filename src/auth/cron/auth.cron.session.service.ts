import { Inject, Injectable, Scope } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { LessThan } from "typeorm";

import "dotenv/config";

import { PsBaseCodeEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";
import { CONSOLE, CRON } from "src/app.const";
import { getDataSourceAdmin, getOrgList } from "src/database/datasource/tenancy/tenancy.utils";
import { UserSessionEntity } from "src/entity/#organization/user/userSession.entity";
import { PubSubService } from "src/pubsub/pubsub.service";
import { AUTH } from "../auth.const";
import { resetUserLoginValidAll } from "src/modules/user/utils/user.login.utils";
import { getTimeoutAuthSession } from "../session/auth.session.utils";
import { UserSessionTypeEnum } from "../session/auth.session.const";
import { wLogger } from "src/modules/logger/logging.module";

/********************************************
 * РАБОТА С СЕССИЯМИ
 ********************************************/
let blocked = false;
@Injectable({ scope: Scope.DEFAULT })
export class AuthCronSessionService {
  constructor(
    @Inject(PubSubService) private readonly pubSubService: PubSubService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CRON.AUTH.SESSION.MASK, { name: CRON.AUTH.SESSION.NAME })
  async execAuthSession(): Promise<void> {
    // заблокировать повторный вход
    if (blocked) return;
    blocked = true;

    // CRON: остановить
    const cronJob = this.schedulerRegistry.getCronJob(CRON.SIGN.NAME);
    cronJob.stop();

    // если запуск заблокирован: выход без активации
    if (process.env.DISABLED_CRON === "true") return;

    try {
      const orgList = await getOrgList();
      for (const org of orgList) {
        try {
          // источник данных
          const dataSource = await getDataSourceAdmin(org);
          const userSessionRepository = dataSource.getRepository(UserSessionEntity);

          /**
           * сессии: удалить записи с истекшим временем сессии
           */
          for (const userSessionEntity of await userSessionRepository.findBy({
            date_expiration: LessThan(new Date()),
          })) {
            wLogger.info('Удалена сессия пользователя (истекло время сессии)', userSessionEntity);
            await this.pubSubService.pubSys({
              org: org,
              session_id: userSessionEntity.id,
              msg: AUTH.ERR.SESSION.NONE,
              code: [PsBaseCodeEnum.session_terminated],
            });
            await userSessionRepository.delete({ id: userSessionEntity.id });
          }

          /**
           * сессии: удалить записи с неактивными пользователями (превышено допустимое время бездействия)
           * только для обычных пользователей
           */
          const dateSessionExp = new Date(new Date().getTime() - getTimeoutAuthSession(org) * 1000);
          for (const userSessionEntity of await userSessionRepository.findBy({
            date_activity: LessThan(dateSessionExp),
            type_session: UserSessionTypeEnum.person,
          })) {
            wLogger.info('Удалена сессия пользователя (бездействие)', userSessionEntity);
            await this.pubSubService.pubSys({
              org: org,
              session_id: userSessionEntity.id,
              msg: AUTH.ERR.SESSION.TIMEOUT+'[1]',
              code: [PsBaseCodeEnum.session_terminated],
            });
            await userSessionRepository.delete({ id: userSessionEntity.id });
          }

          /**
           * пользователи: разблокировать попытки неудачного входа
           */
          await resetUserLoginValidAll({managerLocal: dataSource.manager});

        } catch (err) {
          wLogger.error(
            CONSOLE.COLOR.FG.RED + "База данных: " + org + CONSOLE.COLOR.RESET + "\n",
            err,
          );
        }
      }
    } finally {
      // CRON: запустить
      cronJob.start();
      blocked = false;
    }
  }
}
