import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource, In } from "typeorm";
import { setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../../../entity/#organization/emp/emp.entity";
import { NotifyTypeEntity } from "../../../../entity/#organization/notify/notifyType.entity";

const ERR = "Уведомления подписки: ошибка ";

@Injectable()
export class NotifySubscribeService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  /**
   * GET
   */
  async getNotifySubscribe(emp_id: number): Promise<number[] | HttpException> {
    try {
      const empEntity = await this.dataSource.manager.findOneOrFail(EmpEntity, {
        relations: { NotifyTypes: true },
        where: { id: emp_id },
        order: { NotifyTypes: { id: "DESC" } },
      });
      return empEntity.notify_types_ids;
    } catch (err) {
      return setErrorGQL(ERR + "чтения", err);
    }
  }

  /**
   * SET
   */
  async setNotifySubscribe(
    emp_id: number,
    notify_type_ids: number[],
  ): Promise<boolean | HttpException> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const empEntity = await manager.findOneOrFail(EmpEntity, {
          where: { id: emp_id },
          relations: ["NotifyTypes"],
        });

        empEntity.NotifyTypes = await manager.findBy(NotifyTypeEntity, {
          id: In(notify_type_ids),
        });

        await manager.save(EmpEntity, empEntity);

        return true;
      });
    } catch (err) {
      return setErrorGQL(ERR + "записи", err);
    }
  }
}
