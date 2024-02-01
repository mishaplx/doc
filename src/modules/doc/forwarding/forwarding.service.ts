import { HttpException, Inject, Injectable } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DataSource, In, Repository } from "typeorm";

import { PsBaseEnum } from "../../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { DocStatus } from "../doc.const";
import { FORWARDING_STATUS, FORWARDING_VIEW, PREF_ERR } from "../../../common/enum/enum";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";
import { ForwardingEntity } from "../../../entity/#organization/forwarding/forwarding.entity";
import { getPaginatedData, paginatedResponseResult } from "../../../pagination/pagination.service";
import { PaginationInput } from "../../../pagination/paginationDTO";
import { wLogger } from "../../logger/logging.module";
import { NotifyTypeEnum } from "../../notify/notify.const";
import { NotifyOrgService } from "../../notify/org/notifyOrg.service";
import { GetForwardArgs } from "../dto/get-list";
import { PaginatedForwardListResponse } from "../dto/pagination-forward-list.dto";
import { getWhereFindAllForward } from "../utils/doc.utils";

// передача\пересылка
@Injectable()
export class ForwardingService {
  private readonly forwardRepository: Repository<ForwardingEntity>;
  private readonly docRepository: Repository<DocEntity>;

  constructor(
    @Inject(DATA_SOURCE) dataSource: DataSource,
    @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
  ) {
    this.forwardRepository = dataSource.getRepository(ForwardingEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
  }

  async getAllForwardingList(
    args: GetForwardArgs,
    pagination: PaginationInput,
  ): Promise<PaginatedForwardListResponse> {
    const where = getWhereFindAllForward(args);
    const { pageNumber, pageSize, All } = pagination;
    const [positions, total] = await getPaginatedData(
      this.forwardRepository,
      pageNumber,
      pageSize,
      where,
      All,
    );

    return paginatedResponseResult(positions, pageNumber, pageSize, total);
  }

  async getForwardById(id: number): Promise<Awaited<ForwardingEntity>> {
    return this.forwardRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async addReceiver(
    token: IToken,
    note = null,
    doc_id: number,
    emp_receiver: [number],
    forward_view: number,
    is_notify_emp_creator: boolean,
  ): Promise<ForwardingEntity[] | HttpException> {
    // const { docstatus } = await this.docRepository.findOne({
    const docEntity = await this.docRepository.findOne({
      where: {
        id: doc_id,
      },
    });
    if (
      docEntity.docstatus !== DocStatus.REGISTRATE.id &&
      docEntity.docstatus !== DocStatus.INVIEW.id
    ) {
      return new HttpException(
        `${PREF_ERR} Направить документ для дальнейшей работы можно в статусе Зарегистрирован или На рассмотрении`,
        404,
      );
    }
    await this.docRepository.update({ id: doc_id }, { docstatus: DocStatus.INVIEW.id });
    if (forward_view == FORWARDING_VIEW.VEIW.id) {
      for (const el of emp_receiver) {
        const receiverSave = this.forwardRepository.create({
          note: note,
          emp_creator: token.current_emp_id,
          id_doc: doc_id,
          del: false,
          temp: false,
          emp_receiver: el,
          veiw_id: forward_view,
          date_sender: new Date(),
          status_id: FORWARDING_STATUS.STATUS_NOT_VEIW.id,
          is_notify_emp_creator: is_notify_emp_creator,
        });
        await this.forwardRepository.save(receiverSave);
      }
    } else {
      for (const el of emp_receiver) {
        const receiverSave = this.forwardRepository.create({
          note: note,
          emp_creator: token.current_emp_id,
          id_doc: doc_id,
          del: false,
          temp: false,
          emp_receiver: el,
          veiw_id: forward_view,
          date_sender: new Date(),
          status_id: FORWARDING_STATUS.STATUS_NOT_VEIW.id,
          is_notify_emp_creator: is_notify_emp_creator,
        });
        await this.forwardRepository.save(receiverSave);
      }
    }

    await this.notifyOrgService.addNotify({
      notify_type_id: NotifyTypeEnum.DOC_GET,
      doc_id: docEntity.id,
      emp_ids: emp_receiver,
      message: "Документ № " + docEntity.reg_num + ": передан / переслан Вам",
      kind: PsBaseEnum.info,
    });

    return await this.forwardRepository.find({
      where: {
        id_doc: doc_id,
        emp_receiver: In(emp_receiver),
      },
    });
  }

  async closeForwarding(
    id_forwarding: number,
    token,
    comment_end = null,
  ): Promise<ForwardingEntity | HttpException> {
    const { veiw_id, emp_receiver } = await this.forwardRepository.findOne({
      where: {
        id: id_forwarding,
      },
    });
    if (veiw_id !== FORWARDING_VIEW.VEIW.id) {
      return new HttpException(
        `${PREF_ERR}Закрыть можно только пересылку с видом передачи «В работе»`,
        404,
      );
    }
    if (emp_receiver !== token.current_emp_id) {
      return new HttpException(
        `${PREF_ERR}Закрыть может только тот, на кого была сделана пересылка.`,
        404,
      );
    }
    await this.forwardRepository.update(id_forwarding, {
      comment_end: comment_end,
      date_end_sender: new Date(),
    });
    return await this.forwardRepository.findOne({
      where: {
        id: id_forwarding,
      },
    });
  }

  async deleteForwarding(id_forwarding: number): Promise<boolean> {
    try {
      const { id_doc } = await this.forwardRepository.findOne({
        select: {
          id_doc: true,
        },
        where: {
          id: id_forwarding,
        },
      });
      await this.forwardRepository.delete({ id: id_forwarding });
      const countForward = await this.forwardRepository.find({
        where: {
          id_doc: id_doc,
        },
      });
      if (!countForward.length) {
        await this.docRepository.update({ id: id_doc }, { docstatus: DocStatus.REGISTRATE.id });
      }

      return true;
    } catch (e) {
      wLogger.error(e);
      return false;
    }
  }
}
