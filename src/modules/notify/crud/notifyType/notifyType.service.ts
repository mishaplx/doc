import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, ILike, In, Repository } from "typeorm";

import { setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { NotifyTypeEntity } from "../../../../entity/#organization/notify/notifyType.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  NotifyTypeDtoCreate,
  NotifyTypeDtoDel,
  NotifyTypeDtoGet,
  NotifyTypeDtoList,
  NotifyTypeDtoUpdate,
  OrderNotifyTypeEnum,
  OrderNotifyTypeInput,
  PaginatedNotifyTypeResponse,
} from "./notifyType.dto";

const ERR = "Уведомления типы: ошибка ";

@Injectable()
export class NotifyTypeService {
  private readonly notifyTypeRepository: Repository<NotifyTypeEntity>;
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    this.notifyTypeRepository = dataSource.getRepository(NotifyTypeEntity);
  }

  /**
   * LIST
   */
  async listNotifyType(
    args: NotifyTypeDtoList,
    pagination: PaginationInput,
    orderBy: OrderNotifyTypeInput, // FIXME = { value: OrderNotifyTypeEnum.id, sortEnum: SortEnum.ASC },
  ): Promise<PaginatedNotifyTypeResponse | HttpException> {
    try {
      const where = {
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        notify_type_group_id: args?.notify_type_group_id,
        name: args?.name ? ILike(`%${args.name}%`) : undefined,
      };
      return await listPaginationData({
        repository: this.notifyTypeRepository,
        where: where,
        pagination: pagination,
        order: orderBy,
      });
    } catch (err) {
      return setErrorGQL(ERR + "чтения списка", err);
    }
  }

  /**
   * GET
   */
  async getNotifyType(args: NotifyTypeDtoGet): Promise<NotifyTypeEntity | HttpException> {
    try {
      return await this.notifyTypeRepository.findOneByOrFail({
        id: args.id,
      });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createNotifyType(args: NotifyTypeDtoCreate): Promise<NotifyTypeEntity | HttpException> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const numDto = await manager.create(NotifyTypeEntity, args);
        return await manager.save(NotifyTypeEntity, numDto);
      });
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  /**
   * UPDATE
   */
  async updateNotifyType(args: NotifyTypeDtoUpdate): Promise<NotifyTypeEntity | HttpException> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        await manager.update(NotifyTypeEntity, args.id, args);
        return await this.notifyTypeRepository.findOneByOrFail({ id: args.id });
      });
    } catch (err) {
      return setErrorGQL(ERR + "обновления записи", err);
    }
  }

  /**
   * DELETE
   */
  async deleteNotifyType(args: NotifyTypeDtoDel): Promise<boolean | HttpException> {
    try {
      const rec = await this.getNotifyType(args as NotifyTypeDtoGet);
      if (isInstance(rec, HttpException)) throw new Error();

      await this.notifyTypeRepository.delete(args);
      return true;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записи", err);
    }
  }
}
