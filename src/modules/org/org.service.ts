import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { customError } from "../../common/type/errorHelper.type";
import { globalSearchBuilderOrganization } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { OrgEntity } from "../../entity/#organization/org/org.entity";
import { SmdoAbonentsEntity } from "../../entity/#organization/smdo/smdo_abonents.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { CreateOrgInput } from "./dto/create-org.input";
import { GetOrgsArgs } from "./dto/get-orgs.args";
import { OrderOrgInput } from "./dto/order-org-request.dto";
import { PaginatedOrgResponse } from "./dto/paginated-org-response.dto";
import { UpdateOrgInput } from "./dto/update-org.input";
import { getOrderFindAllOrg, getWhereFindAllOrg } from "./org.utils";
@Injectable()
export class OrgService {
  private readonly orgRepository: Repository<OrgEntity>;
  private readonly smdoAbonentsRepository: Repository<SmdoAbonentsEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.orgRepository = dataSource.getRepository(OrgEntity);
    this.smdoAbonentsRepository = dataSource.getRepository(SmdoAbonentsEntity);
  }

  async create(createOrgInput: CreateOrgInput): Promise<OrgEntity> {
    const newOrg = this.orgRepository.create(createOrgInput);
    const idSmdoName = Number(createOrgInput.smdocode);

    if (createOrgInput.smdocode == "") {
      const { id } = await this.orgRepository.save(newOrg);
      return this.orgRepository.findOneByOrFail({ id });
    }
    const smdoNameOrg = await this.smdoAbonentsRepository.findOne({
      where: {
        id: idSmdoName,
      },
    });
    await this.checkExistedSmdo(smdoNameOrg.smdoCode);
    newOrg.smdocode = smdoNameOrg.smdoCode;
    newOrg.smdoId = smdoNameOrg.smdoId;
    newOrg.del = false;
    newOrg.temp = false;
    const { id } = await this.orgRepository.save(newOrg);
    return this.orgRepository.findOneByOrFail({ id });
  }

  async findAll(
    args: GetOrgsArgs,
    pagination: PaginationInput,
    orderBy: OrderOrgInput,
    searchField: string,
  ): Promise<PaginatedOrgResponse> {
    const { pageNumber, pageSize, All } = pagination;

    if (searchField?.trim()) {
      const queryBuilder = this.orgRepository.createQueryBuilder("org");

      await globalSearchBuilderOrganization(queryBuilder, searchField);

      const [orgs, total] = await queryBuilder.getManyAndCount();
      return paginatedResponseResult(orgs, pageNumber, pageSize, total);
    }

    const where = getWhereFindAllOrg(args);
    const order = getOrderFindAllOrg(orderBy);
    const relation = { Region: true, SmdoAbonent: true };

    const [orgs, total] = await getPaginatedData(
      this.orgRepository,
      pageNumber,
      pageSize,
      where,
      All,
      relation,
      order,
    );

    return paginatedResponseResult(orgs, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<OrgEntity> {
    return this.orgRepository.findOneBy({ id });
  }

  getAllOrg(): Promise<OrgEntity[]> {
    return this.orgRepository.find({});
  }

  async checkExistedSmdo(smdocode, idOrg = undefined): Promise<void> {
    const existedOrg = await this.orgRepository.findOne({
      where: {
        smdocode,
      },
    });
    if (idOrg && existedOrg && existedOrg.id === idOrg) return;
    if (existedOrg)
      customError(`Данная организация в СМДО уже привязана к организации: ${existedOrg.nm}`);
  }

  async update(idOrg: number, updateOrgInput: UpdateOrgInput): Promise<OrgEntity> {
    if (updateOrgInput.idOrgSmdo) {
      const smdo = await this.smdoAbonentsRepository.findOne({
        where: {
          id: updateOrgInput.idOrgSmdo,
        },
      });
      await this.checkExistedSmdo(smdo.smdoCode, idOrg);

      await this.orgRepository.update(idOrg, {
        smdocode: smdo.smdoCode,
        smdoId: smdo.smdoId,
      });
      delete updateOrgInput.idOrg;
      delete updateOrgInput.idOrgSmdo;
      await this.orgRepository.update(idOrg, updateOrgInput);
    } else {
      delete updateOrgInput.idOrg;
      delete updateOrgInput.idOrgSmdo;
      updateOrgInput.smdocode = "";
      await this.orgRepository.update(idOrg, {
        ...updateOrgInput,
        smdoId: null,
      });
    }
    return await this.orgRepository.findOne({
      where: {
        id: idOrg,
      },
    });
  }

  async remove(id: number): Promise<boolean> {
    const { affected } = await this.orgRepository.update(id, { del: true });
    return !!affected;
  }
}
