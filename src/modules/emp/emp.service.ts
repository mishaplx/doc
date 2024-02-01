import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from "typeorm";

import { PsBaseEnum } from "../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { PREF_ERR } from "../../common/enum/enum";
import { globalSearchEmpBuilder } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { RolesEntity } from "../../entity/#organization/role/role.entity";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";
import { UserEntity } from "../../entity/#organization/user/user.entity";
import { UserAllEmpEntity } from "../../entity/#organization/userAllEmp/userAllEmp.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { NotifyTypeEnum } from "../notify/notify.const";
import { NotifyOrgService } from "../notify/org/notifyOrg.service";
import { CreateEmpInput } from "./dto/create-emp.input";
import { GetEmpArgs } from "./dto/get-emp.args";
import { OrderEmpInput } from "./dto/order-emp-request.dto";
import { PaginatedEmpResponse } from "./dto/paginated-emp-response.dto";
import { UpdateEmpInput } from "./dto/update-emp.input";
import { setQueryBuilderEmp } from "./emp.utils";

@Injectable()
export class EmpService {
  private readonly empRepository: Repository<EmpEntity>;
  private readonly UserInDbRepository: Repository<UserEntity>;
  private readonly StaffRepository: Repository<StaffEntity>;
  private readonly RoleRepository: Repository<RolesEntity>;
  private readonly userAllEmpRepository: Repository<UserAllEmpEntity>;

  constructor(
    @Inject(DATA_SOURCE) dataSource: DataSource,
    @Inject(NotifyOrgService) private readonly notifyOrgService: NotifyOrgService,
  ) {
    this.empRepository = dataSource.getRepository(EmpEntity);
    this.UserInDbRepository = dataSource.getRepository(UserEntity);
    this.StaffRepository = dataSource.getRepository(StaffEntity);
    this.RoleRepository = dataSource.getRepository(RolesEntity);
    this.userAllEmpRepository = dataSource.getRepository(UserAllEmpEntity);
  }

  async create(createEmpInput: CreateEmpInput): Promise<EmpEntity | HttpException> {
    let emp_id = undefined;
    try {
      const { user_id } = await this.StaffRepository.findOne({
        where: {
          id: createEmpInput.staff_id,
        },
      });

      const user = await this.UserInDbRepository.findOne({
        where: {
          id: user_id,
        },
      });

      if (user.isblocked) {
        return new HttpException(
          `${PREF_ERR} данный пользователь деактивирован`,
          HttpStatus.BAD_REQUEST,
        );
      }

      createEmpInput.user_id = user_id;
      delete createEmpInput.staff_id;
      const { roles } = createEmpInput;

      if (createEmpInput.roles == undefined) {
        createEmpInput.roles = null;
      } else {
        createEmpInput.roles = await this.RoleRepository.find({
          where: {
            id: In(roles),
          },
        });
      }

      const { id } = await this.empRepository.save(createEmpInput);
      emp_id = id;

      await this.UserInDbRepository.update({ id: user_id }, { current_emp_id: id });

      // подписать emp на уведомления
      await this.notifyOrgService.subscribeNewEmpByNotify(emp_id);

      // уведомление
      await this.notifyOrgService.addNotify({
        emp_ids: [emp_id],
        notify_type_id: NotifyTypeEnum.ANY_EMP_CHANGE,
        message: "Ваше назначение создано",
        kind: PsBaseEnum.info,
      });

      await this.userAllEmpRepository.save({
        emp: emp_id,
        user: user.id,
      });

      return await this.empRepository.findOneByOrFail({ id });
    } catch (e) {
      await this.empRepository.delete({ id: emp_id });
    }
  }

  async findAll(
    args: GetEmpArgs,
    pagination: PaginationInput,
    orderBy: OrderEmpInput,
    searchField: string,
  ): Promise<PaginatedEmpResponse> {
    const queryBuilder = this.empRepository.createQueryBuilder("emp");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchEmpBuilder(queryBuilder, searchField);
    } else {
      setQueryBuilderEmp(args, orderBy, queryBuilder);
    }
    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }
    const [emps, total] = await queryBuilder.getManyAndCount();
    return paginatedResponseResult(emps, pageNumber, pageSize, total);
  }

  async findOne(id: number): Promise<EmpEntity> {
    return await this.empRepository.findOne({
      select: {
        roles: { name: true, id: true },
      },
      where: {
        id: id,
      },
      relations: {
        roles: true,
      },
    });
  }

  async update(id: number, updateEmpInput: UpdateEmpInput): Promise<EmpEntity | HttpException> {
    try {
      const { user_id } = await this.empRepository.findOne({
        select: { user_id: true },
        where: { id: updateEmpInput.id },
      });
      const user = await this.UserInDbRepository.findOne({
        where: {
          id: user_id,
        },
      });
      if (user.isblocked) {
        return new HttpException(
          `${PREF_ERR} данный пользователь деактивирован`,
          HttpStatus.BAD_REQUEST,
        );
      }
      updateEmpInput.id = id;
      updateEmpInput.staff_id = user_id;
      const updateEmp = await this.empRepository.preload(updateEmpInput);
      updateEmp.roles = await this.RoleRepository.find({
        where: {
          id: In(updateEmpInput.roles),
        },
      });
      await this.empRepository.save(updateEmp);
      await this.UserInDbRepository.update(user_id, {
        current_emp_id: updateEmp.id,
      });
      const ret = this.empRepository.findOneByOrFail({ id });

      // уведомление
      await this.notifyOrgService.addNotify({
        emp_ids: [updateEmpInput.id],
        notify_type_id: NotifyTypeEnum.ANY_EMP_CHANGE,
        message: "Ваше назначение обновлено",
        kind: PsBaseEnum.info,
      });

      return ret;
    } catch (e) {
      return new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
  async remove(id: number): Promise<boolean | HttpException> {
    try {
      // уведомление до операции удаления
      await this.notifyOrgService.addNotify({
        emp_ids: [id],
        notify_type_id: NotifyTypeEnum.ANY_EMP_CHANGE,
        message: "Ваше назначение удалено",
        kind: PsBaseEnum.info,
      });

      const { affected } = await this.empRepository.update(id, { del: true });

      await this.UserInDbRepository.update(
        {
          current_emp_id: id,
        },
        { current_emp_id: null },
      );

      await this.userAllEmpRepository.update(
        { emp: id },
        {
          emp: null,
        },
      );

      return !!affected;
    } catch (e) {
      new HttpException("Ошибка удаления", HttpStatus.BAD_REQUEST);
    }
  }
}
