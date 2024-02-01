import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { GetDirectoriesArgs } from "../../common/argsType/get-directories.args";
import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { OrderCatalogEnum } from "../../common/enum/enum";
import { customError } from "../../common/type/errorHelper.type";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { getWhereFindAll } from "../../directories/directories.utils";
import { CitizenEntity } from "../../entity/#organization/citizen/citizen.entity";
import { OrgEntity } from "../../entity/#organization/org/org.entity";
import { RegionEntity } from "../../entity/#organization/region/region.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { CreateRegionInput } from "./dto/create-region.input";
import { PaginatedRegionResponse } from "./dto/paginated-region-response.dto";
import { UpdateRegionInput } from "./dto/update-region.input";

@Injectable()
export class RegionService {
  private readonly regionRepository: Repository<RegionEntity>;
  private readonly citizenRepository: Repository<CitizenEntity>;
  private readonly orgRepository: Repository<OrgEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.regionRepository = dataSource.getRepository(RegionEntity);
    this.citizenRepository = dataSource.getRepository(CitizenEntity);
    this.orgRepository = dataSource.getRepository(OrgEntity);
  }

  create(createRegionInput: CreateRegionInput): Promise<RegionEntity> {
    const newRegion = this.regionRepository.create(createRegionInput);
    return this.regionRepository.save(newRegion);
  }

  async findAll(
    args: GetDirectoriesArgs,
    pagination: PaginationInput,
    orderBy: OrderCatalogInput,
    searchField?: string,
  ): Promise<PaginatedRegionResponse> {
    const where = getWhereFindAll(args);
    const { pageNumber, pageSize, All } = pagination;

    const order = orderBy?.value === OrderCatalogEnum.nm ? { nm: orderBy.sortEnum } : null;
    if (searchField?.trim()) {
      const [org, total] = await searchAllColumnWithoutRelation(
        this.regionRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(org, pageNumber, pageSize, total);
    }
    const [regions, total] = await getPaginatedData(
      this.regionRepository,
      pageNumber,
      pageSize,
      where,
      All,
      null,
      order,
    );

    return paginatedResponseResult(regions, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<RegionEntity> {
    return this.regionRepository.findOneBy({ id });
  }

  async update(id: number, updateRegionInput: UpdateRegionInput): Promise<RegionEntity> {
    await this.regionRepository.update(id, updateRegionInput);
    return this.regionRepository.findOneByOrFail({ id });
  }

  async remove(id: number): Promise<boolean> {
    const countCitizen = await this.citizenRepository.count({
      where: {
        region_id: id,
        del: false,
      },
    });

    const countOrg = await this.orgRepository.count({
      where: {
        region: id,
        del: false,
      },
    });

    if (countCitizen || countOrg) {
      customError("Регион привязан к справочнику физ. лиц/организаций");
    }

    const { affected } = await this.regionRepository.update(
      { id: id },
      {
        del: true,
      },
    );
    return !!affected;
  }
}
