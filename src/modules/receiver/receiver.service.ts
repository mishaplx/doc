import { Inject, Injectable } from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { ReceiverEntity } from "../../entity/#organization/receiver/receiver.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { CreateReceiverInput } from "./dto/create-receiver.input";
import { GetReceiverArgs } from "./dto/get-receiver.args";
import { OrderReceiverRequestDto } from "./dto/order-receiver-request.dto";
import { PaginatedReceiverResponse } from "./dto/paginated-receiver-response.dto";
import { UpdateReceiverInput } from "./dto/update-receiver.input";
import { getOrderFindAllTemp, getWhereFindAllTemp } from "./receiver.utils";

@Injectable()
export class ReceiverService {
  private readonly receiverEntityRepository: Repository<ReceiverEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.receiverEntityRepository = dataSource.getRepository(ReceiverEntity);
  }

  async create(createTempContentInput: CreateReceiverInput): Promise<ReceiverEntity> {
    const newTempContent = this.receiverEntityRepository.create(createTempContentInput);

    const { id } = await this.receiverEntityRepository.save(newTempContent);
    return this.receiverEntityRepository.findOneByOrFail({ id });
  }

  async findAll(
    args: GetReceiverArgs,
    pagination: PaginationInput,
    orderBy: OrderReceiverRequestDto,
    searchField: string,
  ): Promise<PaginatedReceiverResponse> {
    const where = getWhereFindAllTemp(args);
    const order = getOrderFindAllTemp(orderBy);
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      const [template, total] = await searchAllColumnWithoutRelation(
        this.receiverEntityRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(template, pageNumber, pageSize, total);
    }
    const [template, total] = await getPaginatedData(
      this.receiverEntityRepository,
      pageNumber,
      pageSize,
      where,
      All,
      null,
      order,
    );

    return paginatedResponseResult(template, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<ReceiverEntity> {
    return this.receiverEntityRepository.findOneBy({ id: id, del: false });
  }

  async update(id: number, updateTempConInput: UpdateReceiverInput): Promise<ReceiverEntity> {
    await this.receiverEntityRepository.update(id, updateTempConInput);
    return await this.receiverEntityRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async remove(id: number): Promise<boolean> {
    const { affected } = await this.receiverEntityRepository.update(id, { del: true });
    return !!affected;
  }
}
