import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import "dotenv/config";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { CorrespondentEntity } from "src/entity/#organization/correspondent/correspondent.entity";
import { DataSource, In, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { OrgEntity } from "../../entity/#organization/org/org.entity";
import { SmdoStackEntity } from "../../entity/#organization/smdo/smdo_stack.entity";
import { wLogger } from "../../modules/logger/logging.module";
import { listPaginationData } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { GetStackArgs } from "./dto/get-stack.args";
import { OrderStackInput } from "./dto/order-stack-request.dto";
import { PaginatedStackResponse } from "./dto/paginated-stack-response.dto";
import { DocStatus } from "src/modules/doc/doc.const";
import { customError } from "src/common/type/errorHelper.type";
import { TdocEntity } from "../../entity/#organization/doc/tdoc.entity";

@Injectable()
export class StackService {
  private readonly stackRepository: Repository<SmdoStackEntity>;
  private readonly docRepository: Repository<DocEntity>;
  private readonly tdocRepository: Repository<TdocEntity>;
  private readonly orgRepository: Repository<OrgEntity>;
  private readonly correspondentRepository: Repository<CorrespondentEntity>;

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    this.stackRepository = dataSource.getRepository(SmdoStackEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
    this.tdocRepository = dataSource.getRepository(TdocEntity);
    this.orgRepository = dataSource.getRepository(OrgEntity);
    this.correspondentRepository = dataSource.getRepository(CorrespondentEntity);
  }

  async getStack(
    args: GetStackArgs,
    pagination: PaginationInput,
    order: OrderStackInput,
  ): Promise<PaginatedStackResponse> {
    try {
      return await listPaginationData({
        repository: this.stackRepository,
        pagination: pagination,
        order: order ?? { id: "DESC" },
        filter: args,
      });
    } catch (e) {
      console.log(e);
      wLogger.error(e);
    }
  }

  async deleteStack(stackId: number): Promise<boolean> {
    try {
      const stack = await this.stackRepository.findOne({
        where: { id: stackId },
      });
      if (!stack) throw new BadRequestException("Пакет не найден в очереди");
      await this.stackRepository.delete({ id: stack.id });
      return true;
    } catch (e) {
      wLogger.error(e);
      return false;
    }
  }

  private readonly ERR_MSG_DOC_STATUS = "Недопустимый статус документа";

  async addStack(body: any, token: IToken): Promise<SmdoStackEntity> {
    body = JSON.parse(body);
    const doc = await this.docRepository.findOne({
      where: { id: body.documentId },
    });
    // Допустимый статус - Зарегистрирован
    if (doc.docstatus !== DocStatus.REGISTRATE.id) {
      customError(this.ERR_MSG_DOC_STATUS);
    }
    const smdoDocTypes = (await doc?.Tdoc)?.smdoDocTypes;
    if (!smdoDocTypes) {
      customError('Вид документа не привязан к справочнику "Виды документов СМДО"');
    }
    body.info = { title: doc.header, regNum: doc.reg_num, tdoc: smdoDocTypes };
    const correspondents = await this.correspondentRepository.find({
      where: { id: In(body.corrIds) },
    });
    const correspondentsOrgsId = correspondents.map((x) => x.org);
    const orgs = await this.orgRepository.find({ where: { id: In(correspondentsOrgsId) } });
    body.info.receivers = orgs.map((x) => x.nm).toString();
    const params = {
      body: body,
      dtc: new Date(),
      emp_id: token.current_emp_id,
      title: doc.header,
      regNum: doc.reg_num,
      tdoc: doc.tdoc,
      receivers: body.info.receivers,
    };
    return await this.stackRepository.save(params);
  }

  async editStack(
    stackId: number,
    is_active: boolean,
    body: any,
    token: IToken,
  ): Promise<SmdoStackEntity> {
    try {
      const stack = await this.stackRepository.findOne({
        where: { id: stackId },
      });
      if (!stack) throw new BadRequestException("Пакет не найден в очереди");
      if (!is_active === undefined && !body) throw new BadRequestException("А что будем менять?");
      if (!body) body = stack.body;
      else body = JSON.parse(body);
      if (!is_active === undefined) is_active = stack.is_active;
      await this.stackRepository.save({
        id: stack.id,
        body,
        is_active,
        emp_id: token.current_emp_id,
      });
      return await this.stackRepository.findOne({
        where: { id: stackId },
      });
    } catch (e) {
      wLogger.error(e);
    }
  }
}
