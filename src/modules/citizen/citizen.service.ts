import { Inject, Injectable } from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { CitizenEntity } from "../../entity/#organization/citizen/citizen.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { getOrderFindAllCitizen, getWhereFindAllCitizen } from "./citizen.utils";
import { createCitizenInput } from "./dto/create-org.input";
import { GetCitizenArgs } from "./dto/get-citizen.args";
import { OrderCitizenInput } from "./dto/order-citizen-request.dto";
import { PaginatedCitizenResponse } from "./dto/paginated-org-response.dto";
import { updateCitizenInput } from "./dto/update-org.input";

@Injectable()
export class CitizenService {
  private readonly citizenRepository: Repository<CitizenEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.citizenRepository = dataSource.getRepository(CitizenEntity);
  }

  async create(createCitizenInput: createCitizenInput): Promise<CitizenEntity> {
    createCitizenInput.del = false;
    createCitizenInput.dtc = new Date();
    createCitizenInput.temp = false;
    if (createCitizenInput.mn?.length == 0) {
      createCitizenInput.mn = null;
    }
    const newCitizen = this.citizenRepository.create(createCitizenInput);
    const { id } = await this.citizenRepository.save(newCitizen);
    return this.citizenRepository.findOneByOrFail({ id });
  }

  async getAllCitizen(
    args: GetCitizenArgs,
    pagination: PaginationInput,
    orderBy: OrderCitizenInput,
    searchField?: string,
  ): Promise<PaginatedCitizenResponse> {
    const where = getWhereFindAllCitizen(args);
    const order = getOrderFindAllCitizen(orderBy);
    const relation = { region: true };
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      const [org, total] = await searchAllColumnWithoutRelation(
        this.citizenRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(org, pageNumber, pageSize, total);
    }
    const [citizen, total] = await getPaginatedData(
      this.citizenRepository,
      pageNumber,
      pageSize,
      where,
      All,
      relation,
      order,
    );

    return paginatedResponseResult(citizen, pageNumber, pageSize, total);
  }

  getCitizenById(id: number): Promise<CitizenEntity> {
    return this.citizenRepository.findOneBy({ id });
  }

  async updateCitizen(id: number, updateCitizenInput: updateCitizenInput): Promise<CitizenEntity> {
    await this.citizenRepository.update(id, updateCitizenInput);
    return this.citizenRepository.findOneByOrFail({ id });
  }

  async deleteCitizen(id: number): Promise<boolean> {
    const { affected } = await this.citizenRepository.update(id, { del: true });
    return !!affected;
  }
}
