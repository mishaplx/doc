// Подразделение
import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { TypeUnitInput } from "../../common/type/TypeUnitInput.type";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { UnitEntity } from "../../entity/#organization/unit/unit.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { GetUnitArgs } from "./dto/get-unit";
import { OrderUnitInput } from "./dto/order-unit-request.dto";
import { PaginatedUnitResponse } from "./dto/subdivision-response";
import { setQueryBuilderUnit } from "./subdivision.utils";

@Injectable()
export class SubdivisionService {
  private readonly UnitRepository: Repository<UnitEntity>;
  private readonly builder: SelectQueryBuilder<UnitEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.UnitRepository = dataSource.getRepository(UnitEntity);
    this.builder = this.UnitRepository.createQueryBuilder("unit");
  }

  async getAllUnit(
    args: GetUnitArgs,
    pagination: PaginationInput,
    orderBy: OrderUnitInput,
    searchField: string,
  ): Promise<PaginatedUnitResponse> {
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      const [unit, total] = await searchAllColumnWithoutRelation(
        this.UnitRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(unit, pageNumber, pageSize, total);
    }
    setQueryBuilderUnit(args, orderBy, this.builder);

    if (!All) {
      this.builder.skip((pageNumber - 1) * pageSize);
      this.builder.take(pageSize);
    }

    const [orgs, total] = await this.builder.getManyAndCount();

    return paginatedResponseResult(orgs, pageNumber, pageSize, total);
  }

  async createUnit(arg: TypeUnitInput): Promise<UnitEntity> {
    arg.temp = false;
    arg.del = false;
    const result = await this.UnitRepository.create(arg);
    return await this.UnitRepository.save(result);
  }

  async updateUnit(arg: TypeUnitInput): Promise<UnitEntity> {
    await this.UnitRepository.update(arg.id, arg);
    const { id } = arg;
    return await this.UnitRepository.findOneBy({
      id: id,
    });
  }

  async deleteUnit(id: number): Promise<UnitEntity> {
    await this.UnitRepository.update(id, {
      del: true,
    });
    return await this.UnitRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async getActiveUnitCode(): Promise<UnitEntity[]> {
    return await this.builder
      .select("")
      .where(`del = false and temp = false and (de is null OR de >= current_date)`)
      .orderBy("nm", "ASC")
      .getMany();
  }

  getUnitById(id: number): Promise<UnitEntity> {
    return this.builder
      .leftJoinAndSelect("unit.ParentUnit", "ParentUnit")
      .where("unit.id=:id", { id })
      .getOne();
  }
}
