import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { PsBaseEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { customError, setErrorGQL } from "src/common/type/errorHelper.type";
import { DATA_SOURCE } from "src/database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { NotifyEntity } from "src/entity/#organization/notify/notify.entity";
import { NotifyTypeEntity } from "src/entity/#organization/notify/notifyType.entity";
import { PubSubService } from "src/pubsub/pubsub.service";
import { NotifyDtoAdd, NotifyDtoCreate } from "../crud/notify/notify.dto";
import { NotifyService } from "../crud/notify/notify.service";
import { NotifySubscribeService } from "../crud/notifySubscribe/notifySubscribe.service";

const ERR = "Уведомления: ошибка ";

@Injectable()
/**
 * РАБОТА С СООБЩЕНИЯМИ
 * не путать:
 * NotifyService - работа с таблицей Notify
 * NotifyPubSubService - работа с NotifyService и PubSubService
 */
export class NotifyOrgService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(NotifyService) private readonly notifyService: NotifyService,
    @Inject(NotifySubscribeService) private readonly notifySubscribeService: NotifySubscribeService,
    @Inject(PubSubService) private readonly pubSubService: PubSubService,
  ) {}

  /**
   * ПОДПИСАТЬ НОВЫЙ EMP НА УВЕДОМЛЕНИЯ
   */
  async subscribeNewEmpByNotify(emp_id: number): Promise<boolean | HttpException> {
    const notifyTypeEntityList = await this.dataSource.manager.find(NotifyTypeEntity, {});
    const notifyTypeIdList = notifyTypeEntityList.map((item) => item.id);
    return await this.notifySubscribeService.setNotifySubscribe(emp_id, notifyTypeIdList);
  }

  /**
   * ДОБАВИТЬ УВЕДОМЛЕНИЕ ПРИ НАЛИЧИИ ПОДПИСКИ
   * СОВЕТ: ВЫЗЫВАТь ПОСЛЕ ТРАНЗАКЦИИ, Т.К. ТА МОЖЕТ БЫТЬ ОТМЕНЕНА, А УВЕДОМЛЕНИЕ ОТПРАВИТСЯ
   */
  async addNotify(data: NotifyDtoAdd): Promise<void> {
    const { emp_ids, ...dataCreate } = data;

    // по очереди все emp
    for (const emp_id of data.emp_ids) {
      if (!emp_id) continue;
      try {
        // подписки для emp
        const empEntity = await this.dataSource.manager.findOneBy(EmpEntity, {
          id: emp_id,
          del: false,
        });

        // подписки нет - выход
        if (!empEntity.notify_types_ids.includes(data.notify_type_id)) continue;

        // блокировки
        let i = 0;
        if (data.doc_id) i++;
        if (data.project_id) i++;
        if (data.job_id) i++;
        if (i != 1) {
          customError(
            "Уведомление должно быть связано с ОДНИМ или документом, или проектом документа, или поручением",
          );
        }

        // тип уведомления
        const notifyTypeEntity = await this.dataSource.manager.findOneBy(NotifyTypeEntity, {
          id: data.notify_type_id,
        });
        if (!notifyTypeEntity) {
          customError("Не определен тип уведомления: id=" + data.notify_type_id);
        }

        // при отсутствии текста сообщения - выход
        if (data.message == "") return;

        // при отсутствии вида - добавить по умолчанию
        if (!data.kind) data.kind = PsBaseEnum.info;

        // создать уведомление
        const notifyEntity = await this.notifyService.createNotify({
          ...dataCreate,
          emp_id: emp_id,
        } as NotifyDtoCreate);
        if (!notifyEntity) {
          customError("Ошибка создания уведомления");
        }

        // отправить PubSub
        // ORG ИЗ ПОДКЛЮЧЕНИЯ К БД
        await this.pubSubService.pubBase({
          org: this.dataSource.driver.database,
          emp_id: emp_id,
          msg_type: data.kind,
          msg: data.message,
        });
      } catch (err) {
        setErrorGQL(ERR + "чтения записи", err);
      }
    }
  }

  /**
   * ПОМЕТИТЬ ВСЕ СООБЩЕНИЯ ПОЛЬЗОВАТЕЛЯ КАК ПРОЧИТАННЫЕ
   */
  async readAllNotify(token: IToken): Promise<boolean> {
    await this.dataSource.manager.update(
      NotifyEntity,
      { emp_id: token.current_emp_id },
      { date_view: new Date() },
    );
    return true;
  }
}
