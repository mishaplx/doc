import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DataSource, Repository } from "typeorm";

import { PREF_ERR } from "../../common/enum/enum";
import { setErrorGQL } from "../../common/type/errorHelper.type";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";
import { UserEntity } from "../../entity/#organization/user/user.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { CreateStaffInput } from "./dto/create-staff.input";
import { GetStaffArgs } from "./dto/get-staff.args";
import { OrderStaffInput } from "./dto/order-staff-request.dto";
import { PaginatedStaffResponse } from "./dto/paginated-staff-response.dto";
import { UpdateStaffInput } from "./dto/update-staff.input";
import { getOrderFindAllStaff, getWhereFindAllStaff } from "./staff.utils";

@Injectable()
export class StaffService {
  private readonly staffRepository: Repository<StaffEntity>;
  private readonly userRepository: Repository<UserEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.staffRepository = dataSource.getRepository(StaffEntity);
    this.userRepository = dataSource.getRepository(UserEntity);
  }

  async create(createStaffInput: CreateStaffInput): Promise<StaffEntity> {
    const newStaff = this.staffRepository.create(createStaffInput);
    return await this.staffRepository.save(newStaff);
  }

  async findAll(
    args: GetStaffArgs,
    pagination: PaginationInput,
    orderBy: OrderStaffInput,
    searchField?: string,
  ): Promise<PaginatedStaffResponse> {
    const where = getWhereFindAllStaff(args);
    const order = getOrderFindAllStaff(orderBy);
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      const [staff, total] = await searchAllColumnWithoutRelation(
        this.staffRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(staff, pageNumber, pageSize, total);
    }
    const [staff, total] = await getPaginatedData(
      this.staffRepository,
      pageNumber,
      pageSize,
      where,
      All,
      null,
      order,
    );

    return paginatedResponseResult(staff, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<StaffEntity> {
    return this.staffRepository.findOneBy({ id });
  }

  async update(id: number, updateStaffInput: UpdateStaffInput): Promise<StaffEntity> {
    await this.staffRepository.update(id, updateStaffInput);
    return this.staffRepository.findOneByOrFail({ id });
  }

  async remove(id: number): Promise<boolean | HttpException> {
    //код для деактивации пользователя при удалении сотрудника
    const staffEntity = await this.staffRepository.findOne({
      where: {
        id: id,
      },
    });
    if (staffEntity.user_id) {
      const { username, isblocked } = await this.userRepository.findOne({
        select: {
          username: true,
          isblocked: true,
        },
        where: {
          id: staffEntity.user_id,
        },
      });
      if (!isblocked) {
        return new HttpException(
          PREF_ERR + `Что бы удалить сотрудника деактивируйте пользователя ${username}`,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        await this.staffRepository.update(id, {
          del: true,
        });
        await this.userRepository.update(staffEntity.user_id, { no_more_activate: true });
        return true;
      }
    } else {
      await this.staffRepository.update(id, {
        del: true,
      });

      if (staffEntity.user_id) {
        await this.userRepository.update(staffEntity.user_id, { no_more_activate: true });
      }

      return true;
    }
  }

  async changePhoneNumber(phoneNumber: string, token: IToken): Promise<boolean | HttpException> {
    try {
      await this.staffRepository.update(
        { id: token.staff_id },
        {
          phone: phoneNumber,
        },
      );
      return true;
    } catch (e) {
      return setErrorGQL("Ошибка обновления");
    }
  }
}
