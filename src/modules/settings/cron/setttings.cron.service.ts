import { Injectable, Scope } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import net from 'net';

import "dotenv/config";

import { getDataSourceAdmin, getOrgList } from "src/database/datasource/tenancy/tenancy.utils";
import { SmdoService } from "src/smdo/smdo.service";

import { CONSOLE, CRON } from "../../../app.const";
import { getSettingsValBool, getSettingsValUrl, setSettings } from "../settings.util";
import { wLogger } from "src/modules/logger/logging.module";
import { SETTING_CONST, TSettingConstNm } from "../settings.const";

const MSG_PING_ERROR = 'Ping error: '

/********************************************
 * СИНХРОНИЗАЦИЯ НАСТРОЕК
 * ДАННЫЙ КРОН БЛОКИРОВАТЬ НЕЛЬЗЯ
 ********************************************/
let blocked = false;
@Injectable({ scope: Scope.DEFAULT })
export class SettingsCronService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  @Cron(CRON.SETTINGS.MASK, { name: CRON.SETTINGS.NAME })
  async execFileMainContent(): Promise<void> {
    // заблокировать повторный вход
    if (blocked) return;
    blocked = true;

    // CRON: остановить
    const cronJob = this.schedulerRegistry.getCronJob(CRON.SETTINGS.NAME);
    cronJob.stop();

    try {
      await setSettings();

      // настройка СМДО
      // FIXME: вынести в отдельный модуль, разобраться с множественным new SmdoService
      // если запуск заблокирован: выход без активации
      if (process.env.DISABLED_CRON !== "true") {
        const orgList = await getOrgList();
        for (const org of orgList) {
          const dataSource = await getDataSourceAdmin(org);
          // if (
          //   getSettingsValBool({
          //     org: dataSource.options.database as string,
          //     key: SETTING_CONST.SMDO_ENABLED.nm,
          //   })
          // ) {
          let smdoService = new SmdoService(dataSource);
          await smdoService.smdoOnStartBehaviour();
          smdoService = null;
          // }
        }
      }


      /**
       * ПИНГ
       * TODO: вынести в отдельный cron.sys
       */

      // список уникальных url
      const url_list: {
        org: string;
        hostname: string;
        port: string;
        many?: boolean;
      }[] = [{
        org: 'database',
        hostname: process.env.DB_HOST,
        port: process.env.DB_PORT,
      }];

      // просмотреть доступные ORG
      const orgList = await getOrgList();
      for (const org of orgList) {
        try {
          const dataSource = await getDataSourceAdmin(org);
          // прочитать url из настроек
          const urls: TSettingConstNm[] = [
            SETTING_CONST.URL_PDF_CREATE.nm,
            SETTING_CONST.URL_PDF_VERIFY.nm,
            SETTING_CONST.URL_SIGN.nm,
          ];
          // добавить проверку url СМДО
          if (
            (process.env.DISABLED_CRON !== "true") &&
            (getSettingsValBool({
              org: dataSource.options.database as string,
              key: SETTING_CONST.SMDO_ENABLED.nm,
            }))
          ) {
            urls.push(SETTING_CONST.SMDO_URL.nm);
          }

          for (const url of urls) {
            // распарсить
            const { hostname, port } = getSettingsValUrl({
              org: org,
              key: url,
            });

            // добавить в url_list
            const url_item = url_list.find(item => ((item.hostname == hostname) && (item.port == port)));
            if (!url_item) {
              url_list.push({ org, hostname, port });
            } else {
              url_item.many = true;
            }
          }
        } catch (err) {
          wLogger.error(
            CONSOLE.COLOR.FG.RED + "База данных: " + org + CONSOLE.COLOR.RESET + "\n",
            err,
          );
        }

        // непосредственно сам пинг
        for (const url_item of url_list) {
          const addr = `[${url_item.org+(url_item.many ? ', ...' : '')}] ${url_item.hostname}:${url_item.port} `;
          const sock = new net.Socket();
          sock.setTimeout(2500);
          sock.on('connect', function() {
              // console.log(addr+'ok');
              sock.destroy();
          }).on('error', function(e) {
              wLogger.error(MSG_PING_ERROR+addr+e.message);
          }).on('timeout', function(e) {
              wLogger.error(MSG_PING_ERROR+addr+'timeout');
          }).connect(Number(url_item.port), url_item.hostname);
        }
      }

    } catch (err) {
      wLogger.error(err);
    } finally {
      // CRON: запустить
      cronJob.start();
      blocked = false;
    }
  }
}
