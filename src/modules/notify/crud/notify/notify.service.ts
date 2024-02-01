import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, ILike, In, IsNull, Repository } from "typeorm";

import { PsBaseCodeEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";
import { PubSubService } from "src/pubsub/pubsub.service";
import { setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { NotifyEntity } from "../../../../entity/#organization/notify/notify.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  NotifyDtoCreate,
  NotifyDtoDel,
  NotifyDtoGet,
  NotifyDtoInfo,
  NotifyDtoList,
  NotifyDtoUpdate,
  OrderNotifyEnum,
  OrderNotifyInput,
  PaginatedNotifyResponse,
} from "./notify.dto";

const ERR = "Уведомления: ошибка ";

@Injectable()
export class NotifyService {
  private readonly notifyRepository: Repository<NotifyEntity>;
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(PubSubService) private readonly pubSubService: PubSubService,
  ) {
    this.notifyRepository = dataSource.getRepository(NotifyEntity);
  }

  /**
   * INFO
   * для системы уведомлений
   */
  async infoNotify(emp_id: number): Promise<NotifyDtoInfo | HttpException> {
    try {
      const notifyEntityList = await this.notifyRepository.find({
        where: { emp_id: emp_id },
        order: {
          date_view: "DESC",
          date_create: "DESC",
        },
        take: 4,
      });
      const notifyUnreadCount = await this.notifyRepository.countBy({
        emp_id: emp_id,
        date_view: IsNull(),
      });

      return {
        data: notifyEntityList,
        count: notifyUnreadCount,
      };
    } catch (err) {
      return setErrorGQL(ERR + "чтения краткого списка", err);
    }
  }

  /**
   * LIST
   */
  async listNotify(
    args: NotifyDtoList,
    pagination: PaginationInput,
    orderBy: OrderNotifyInput,
  ): Promise<PaginatedNotifyResponse | HttpException> {
    try {
      const where = {
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        message: args?.message ? ILike(`%${args.message}%`) : undefined,
        kind: args?.kind,
        notify_type_id: args?.notify_type_id,
        emp_id: args?.emp_id,
        project_id: args?.project_id,
        doc_id: args?.doc_id,
        job_id: args?.job_id,
        date_create: args?.date_create,
        date_control: args?.date_control,
        date_view: args?.date_view,
      };
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // FIXME: ИСПРАВИТЬ В ОДНИХ МЕТОДАХ ПЕРЕДАЕТСЯ STR, В ДРУГИХ - INT (ENUM)
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      let order = {};

      switch (orderBy?.value) {
        case OrderNotifyEnum.kind:
          order = { kind: orderBy.sortEnum };
          break;
        case OrderNotifyEnum.notify_type_id:
          order = { message: orderBy.sortEnum };
          break;
        case OrderNotifyEnum.message:
          order = { message: orderBy.sortEnum };
          break;
        case OrderNotifyEnum.date_create:
          order = { date_create: orderBy.sortEnum };
          break;
        default:
          order = { date_create: "DESC" };
      }
      return await listPaginationData({
        repository: this.notifyRepository,
        where: where,
        pagination: pagination,
        order,
      });
    } catch (err) {
      return setErrorGQL(ERR + "чтения списка", err);
    }
  }

  /**
   * GET
   */
  async getNotify(args: NotifyDtoGet, emp_id: number): Promise<NotifyEntity | HttpException> {
    try {
      return await this.notifyRepository.findOneByOrFail({
        id: args.id,
        emp_id: emp_id,
      });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createNotify(args: NotifyDtoCreate): Promise<NotifyEntity | HttpException> {
    try {
      const ret = await this.dataSource.transaction(async (manager) => {
        const numDto = await manager.create(NotifyEntity, args);
        numDto.date_create = new Date();
        return await manager.save(NotifyEntity, numDto);
      });

      // оповещение об обновлении уведомлений
      await this.pubSubService.pubSys({
        org: this.dataSource.options.database as string,
        emp_id: args.emp_id,
        code: [PsBaseCodeEnum.notify_refresh],
      });

      return ret;
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  /**
   * UPDATE
   */
  async updateNotify(args: NotifyDtoUpdate, emp_id: number): Promise<boolean | HttpException> {
    try {
      const ids = args.ids;
      delete args.ids;
      if (!args.date_view) args.date_view = null;
      const ret = await this.dataSource.transaction(async (manager) => {
        // await manager.update(NotifyEntity, id, args);
        const notifyEntityList = await manager.findBy(NotifyEntity, { id: In(ids) });
        await manager.update(NotifyEntity, notifyEntityList, args);
        return true;
      });

      // оповещение об обновлении уведомлений
      await this.pubSubService.pubSys({
        org: this.dataSource.options.database as string,
        emp_id: emp_id,
        code: [PsBaseCodeEnum.notify_refresh],
      });

      return ret;
    } catch (err) {
      return setErrorGQL(ERR + "обновления записей", err);
    }
  }

  /**
   * DELETE
   */
  async deleteNotify(args: NotifyDtoDel, emp_id: number): Promise<boolean | HttpException> {
    try {
      const rec = await this.getNotify(args as NotifyDtoGet, emp_id);
      if (isInstance(rec, HttpException)) throw new Error();

      // await this.notifyRepository.delete(args);
      const ret = await this.dataSource.transaction(async (manager) => {
        const notifyEntityList = await manager.findBy(NotifyEntity, {
          id: In(args.ids),
          emp_id: emp_id,
        });
        await manager.delete(NotifyEntity, notifyEntityList);
        return true;
      });

      // оповещение об обновлении уведомлений
      await this.pubSubService.pubSys({
        org: this.dataSource.options.database as string,
        emp_id: emp_id,
        code: [PsBaseCodeEnum.notify_refresh],
      });

      return ret;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записей", err);
    }
  }
}
