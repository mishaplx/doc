import { Injectable, Scope } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";

import "dotenv/config";

import { CRON } from "../../../app.const";
import { Incmail } from "../../../common/interfaces/incmail.interface";
import { getDataSourceAdmin, getOrgList } from "../../../database/datasource/tenancy/tenancy.utils";
import { getImapperUnseen, getOption, setImapperSeen } from "../utils/incmail.api.utils";
import { incmailSave } from "../utils/incmail.save.utils";
import { getAuthIncmail } from "../utils/incmail.setting.utils";

/********************************************
 * ПРОЧИТАТЬ ПОЧТУ
 ********************************************/
let blocked = false;
@Injectable({ scope: Scope.DEFAULT })
export class IncmailCronImportService {
  constructor(
    // @Inject(PubSubService) private readonly pubSub: PubSubService,
    // @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CRON.INCMAIL.MASK, { name: CRON.INCMAIL.NAME })
  async importIncmail(): Promise<void> {
    // заблокировать повторный вход
    if (blocked) return;
    blocked = true;

    // CRON: остановить
    const cronJob = this.schedulerRegistry.getCronJob(CRON.INCMAIL.NAME);
    cronJob.stop();

    // если запуск заблокирован: выход без активации
    if (process.env.DISABLED_CRON === "true") return;

    try {
      const orgList = await getOrgList();
      for (const org of orgList) {
        try {
          // источник данных
          const dataSource = await getDataSourceAdmin(org);

          // получить списки хостов, логинов и паролей
          const { host_list, email_list, pass_list } = getAuthIncmail(org);

          // читать поочередно почтовые ящики
          let ind = 0;
          for (const email of email_list) {
            const host = host_list[ind];
            const pass = pass_list[ind];
            ind++;
            const options = getOption({ host, email, pass });

            try {
              // получить непрочитанные письма
              const newMails: Incmail[] = await getImapperUnseen(options);

              dataSource.transaction(async (manager) => {
                // FIXME: ЗАЧЕМ?
                // const uidsInbox: string[] = await getImapperUidAll(options);
                // const del_incmail_ids: number[] = await compareIncmail(dataSource, uidsInbox);
                // if (del_incmail_ids.length > 0) {
                //   await incmailDelete({
                //     manager: manager,
                //     incmail_ids: del_incmail_ids,
                //     delete_file: false,
                //   });
                // }

                // сохранить письма
                await incmailSave({
                  manager: manager,
                  mails: newMails,
                });
              });

              // пометить письма как прочитанные
              const uids = newMails.map((mail) => mail.uid).join(",");
              await setImapperSeen(options, uids);
            } catch (err) {
              console.error(err);
              // // отправить уведомление пользователю
              // await this.pubSub.pubWarning({
              //   emp_id: emp_id,
              //   msg: 'Ошибка импорта из почтового ящика ' + email,
              // });

              // await this.notifyOrgService.addNotify({
              //   notify_type_id: NotifyTypeEnum.SERVER_ERROR,
              //   emp_ids: [ emp_id ], ???
              //   message: "Ошибка импорта из почтового ящика " + email,
              // });
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    } finally {
      // CRON: запустить
      cronJob.start();
      blocked = false;
    }
  }
}
