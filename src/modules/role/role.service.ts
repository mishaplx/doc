import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";

import { DataSource, In, Repository } from "typeorm";
import { PREF_ERR } from "../../common/enum/enum";
import { customError } from "../../common/type/errorHelper.type";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { MenuOptionsEntity } from "../../entity/#organization/role/menuOptions.entity";
import { OperationEntity } from "../../entity/#organization/role/operation.entity";
import { RoleOperationsEntity } from "../../entity/#organization/role/roleOperation.entity";
import { RolesEntity } from "../../entity/#organization/role/role.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { GetRoleArgs } from "./dto/get-roles.args";
import { OrderRolesInput } from "./dto/order-roles-request.dto";
import { PaginatedRoleResponse } from "./dto/paginated-roles-response.dto";
import { UpdateRoleInput } from "./dto/update-role.input";
import { setQueryBuilderRole } from "./role.utils";

@Injectable()
export class RoleService {
  private readonly dataSource: DataSource;
  private readonly roleRepository: Repository<RolesEntity>;
  private readonly menuRepository: Repository<MenuOptionsEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.roleRepository = dataSource.getRepository(RolesEntity);
    this.menuRepository = dataSource.getRepository(MenuOptionsEntity);
  }

  async findAll(
    args: GetRoleArgs,
    pagination: PaginationInput,
    orderBy: OrderRolesInput,
    searchField: string,
  ): Promise<PaginatedRoleResponse> {
    const queryBuilder = this.roleRepository.createQueryBuilder("role");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      const [roles, total] = await searchAllColumnWithoutRelation(
        this.roleRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(roles, pageNumber, pageSize, total);
    }

    setQueryBuilderRole(args, orderBy, queryBuilder);

    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }
    const [roles, total] = await queryBuilder.getManyAndCount();

    return paginatedResponseResult(roles, pageNumber, pageSize, total);
  }

  async findById(id: number): Promise<RolesEntity> {
    const role = await this.roleRepository.findOne({
      relations: {
        Editor: true,
        RoleOperations: {
          Operation: {
            MenuOptions: true,
          },
        },
      },
      where: { id },
    });
    return role;
  }
  async getMenuOps(): Promise<MenuOptionsEntity[] | HttpException> {
    try {
      return await this.menuRepository.find({
        where: {
          del: false,
        },
        order: { id: "ASC" },
      });
    } catch (e) {
      return new HttpException(`${PREF_ERR} ошибка получения данных`, HttpStatus.BAD_REQUEST);
    }
  }

  async create(userId: number): Promise<number> {
    const { id } = await this.roleRepository.save({
      temp: true,
      editor_id: userId,
    });

    return id;
  }

  async update(
    userId: number,
    id: number,
    updateRoleInput: UpdateRoleInput,
  ): Promise<Error | RolesEntity> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const role = {
          id: updateRoleInput.id,
          name: updateRoleInput.name,
          nt: updateRoleInput.nt,
          locked: updateRoleInput.locked,
          temp: false,
          editor_id: userId,
          updated_at: new Date(),
          roles_menu_ops: updateRoleInput.menuOps,
        };

        // Проверяем корректность id опреаций.
        // И обновляем их в роли пользователя.
        if (Array.isArray(updateRoleInput.operations)) {
          const operationsId = updateRoleInput.operations;
          const countOperations = await manager.countBy(OperationEntity, {
            id: In(operationsId),
          });
          if (countOperations !== operationsId.length) {
            customError("Некорректные id операций.");
          }

          // Удаляем старые id операций
          await manager.delete(RoleOperationsEntity, { role_id: role.id });

          // Добавляем новые id операций
          const roleOperations = operationsId.map((operId) => {
            return {
              role_id: role.id,
              operation_id: operId,
            };
          });
          await manager.save(RoleOperationsEntity, roleOperations);
        }

        await manager.update(RolesEntity, id, role);
      });
    } catch (e) {
      return customError("Название роли должно быть уникальным");
    }

    return this.roleRepository.findOne({
      relations: ["Editor", "RoleOperations"],
      where: { id },
    });
  }

  async remove(userId: number, id: number): Promise<boolean> {
    let result: boolean;

    await this.dataSource.transaction(async (manager) => {
      // Удаляем связь с операциями
      await manager.delete(RoleOperationsEntity, { role_id: id });
      const { affected } = await manager.update(RolesEntity, id, {
        del: true,
        editor_id: userId,
        updated_at: new Date(),
      });
      result = !!affected;
    });

    return result;
  }
  async copyRole(current_emp_id, nameRole, role_id): Promise<RolesEntity> {
    const newRoleID = await this.create(current_emp_id);
    const originRole = await this.roleRepository.findOne({
      where: {
        id: role_id,
      },
      relations: {
        RoleOperations: true,
      },
    });
    const operation = originRole.RoleOperations.map((el) => el.operation_id);
    const updateCopyRole: UpdateRoleInput = {
      id: newRoleID,
      name: nameRole,
      nt: originRole.nt,
      locked: originRole.locked,
      operations: operation,
      menuOps: originRole.roles_menu_ops,
    };
    await this.update(current_emp_id, newRoleID, updateCopyRole);
    return this.roleRepository.findOne({
      relations: ["Editor", "RoleOperations"],
      where: { id: newRoleID },
    });
  }
}
