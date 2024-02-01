import { Inject, Injectable } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { getDataSourceAdmin } from "src/database/datasource/tenancy/tenancy.utils";
import { SignEntity } from "src/entity/#organization/sign/sign.entity";

import { DataSource, In, Not, QueryRunner, Repository } from "typeorm";
import { DocPackageStatus, InventoryStatus } from "../../common/enum/enum";
import { customError } from "../../common/type/errorHelper.type";
import { globalSearchBuilderInventory } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocPackageEntity } from "../../entity/#organization/docPackage/docPackage.entity";
import { InventoryEntity } from "../../entity/#organization/inventory/inventory.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { getDocPackageForStatistics } from "../docPackage/docPackage.utils";
import { signAddUtil } from "../sign/utils/sign.utils";
import { GetInventoryArgs } from "./dto/get-inventory.args";
import { OrderInventoryInput } from "./dto/order-inventory-request.dto";
import { PaginatedInventoryResponse } from "./dto/paginated-inventory-response.dto";
import { UpdateInventoryInput } from "./dto/update-inventory.input";
import { formDocumentInventory, queryBuilderInventoryById, setQueryBuilderInventory } from "./inventory.utils";

@Injectable()
export class InventoryService {
  private readonly dataSource: DataSource;
  private readonly inventoryRepository: Repository<InventoryEntity>;

  private readonly ERR_MSG_INVENTORY_NOT_FOUND = "Опись не найдена";
  private readonly ERR_MSG_INVENTORY_STATUS = "Недопустимый статус описи";

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.inventoryRepository = dataSource.getRepository(InventoryEntity);
  }

  async findAll(
    args: GetInventoryArgs,
    pagination: PaginationInput,
    orderBy: OrderInventoryInput,
    searchField: string,
  ): Promise<PaginatedInventoryResponse> {
    const queryBuilder = this.inventoryRepository.createQueryBuilder("inventory");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchBuilderInventory(queryBuilder, searchField);
    } else {
      setQueryBuilderInventory(args, orderBy, queryBuilder);
    }

    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [docPackages, total] = await queryBuilder.getManyAndCount();

    return paginatedResponseResult(docPackages, pageNumber, pageSize, total);
  }

  findById(id: number): Promise<InventoryEntity> {
    return queryBuilderInventoryById(id, this.inventoryRepository);
  }

  async create(userId: number): Promise<number> {
    const { id } = await this.inventoryRepository.save({
      author_id: userId,
      dtc: new Date(),
    });
    return id;
  }

  async update(
    id: number,
    updateInventoryInput: UpdateInventoryInput,
    token: IToken,
  ): Promise<InventoryEntity> {
    const dataSource = await getDataSourceAdmin(token.url);
    await dataSource.transaction(async (manager) => {
      const inventory = await manager.findOneBy(InventoryEntity, { id, del: false });

      if (!inventory) {
        customError(this.ERR_MSG_INVENTORY_NOT_FOUND);
      }

      if (![
        InventoryStatus.NEW,
        InventoryStatus.IN_PROGRESS,
        InventoryStatus.SIGNED,
      ].includes(inventory?.status_id)) {
        customError(this.ERR_MSG_INVENTORY_STATUS);
      }

      // Дела доступные для добавления:
      // - не включены в другую опись;
      // - не включены в акт;
      // - сформирована и подписана внутренняя опись.
      if (Array.isArray(updateInventoryInput.docPackages)) {
        // Убираем старую связь дел с описью
        await manager.update(
          DocPackageEntity,
          { inventory_id: id },
          {
            status_id: DocPackageStatus.INNER_INVENTORY_SIGN,
            inventory_id: null,
          },
        );

        const docPackagesId = updateInventoryInput.docPackages;
        const docPackages = await getDocPackageForStatistics(docPackagesId, manager);

        if (docPackages.length !== docPackagesId.length) {
          customError("Некорректные дела.");
        }

        let countDocPackage = 0;
        let countDoc = 0;
        let year = null;
        let startDate = null;
        let endDate = null;
        let statusInventory = InventoryStatus.NEW;

        if (updateInventoryInput?.docPackages?.[0]) {
          const yearArr: number[] = [];
          const dateArr: Date[] = [];

          for await (const docPackage of docPackages) {
            const mnmcl = await docPackage.Nomenclature;
            yearArr.push(Number((await mnmcl.MainParent).name));
            const docs = await docPackage.Docs;
            countDoc += docs.length;
            docs.forEach((doc) => {
              dateArr.push(doc.dr);
            });
          }

          countDocPackage = docPackages.length;
          const startYear = Math.min(...yearArr);
          const endYear = Math.max(...yearArr);
          startDate = new Date(Math.min(...dateArr.map((date) => new Date(date).getTime())));
          endDate = new Date(Math.max(...dateArr.map((date) => new Date(date).getTime())));
          year = startYear === endYear ? String(startYear) : `${startYear} - ${endYear}`;
          statusInventory = InventoryStatus.IN_PROGRESS;
        }

        updateInventoryInput.count_doc_package = countDocPackage;
        updateInventoryInput.count_doc = countDoc;
        updateInventoryInput.year = year;
        updateInventoryInput.start_date = startDate;
        updateInventoryInput.end_date = endDate;
        updateInventoryInput.status_id = statusInventory;

        // Связываем дела с описью
        await manager.update(
          DocPackageEntity,
          { id: In(updateInventoryInput.docPackages) },
          {
            status_id: DocPackageStatus.INCLUDED_IN_INVENTORY,
            inventory_id: id,
          },
        );
      } else {
        updateInventoryInput.status_id = inventory.count_doc_package
          ? InventoryStatus.IN_PROGRESS
          : InventoryStatus.NEW;
      }

      // Обновляем опись
      await manager.update(InventoryEntity, id, {
        number: updateInventoryInput.number,
        inventory_name_id: updateInventoryInput.inventory_name_id,
        unit: updateInventoryInput.unit,
        nt: updateInventoryInput.nt,
        description: updateInventoryInput.description,
        year: updateInventoryInput.year,
        start_date: updateInventoryInput.start_date,
        end_date: updateInventoryInput.end_date,
        count_doc_package: updateInventoryInput.count_doc_package,
        count_doc: updateInventoryInput.count_doc,
        status_id: updateInventoryInput.status_id,
        temp: false,
      });

      // Формируем документ описи
      await formDocumentInventory(id, manager, token);
    });

    return queryBuilderInventoryById(id, this.inventoryRepository);
  }

  async delete(id: number): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOneBy({ id, del: false });

    if (!inventory) {
      customError(this.ERR_MSG_INVENTORY_NOT_FOUND);
    }

    if (![InventoryStatus.NEW, InventoryStatus.IN_PROGRESS].includes(inventory?.status_id)) {
      customError(this.ERR_MSG_INVENTORY_STATUS);
    }

    await this.dataSource.transaction(async (manager) => {
      // При удалении, дела исключаются из описи.
      await manager.update(
        DocPackageEntity,
        {
          inventory_id: id,
        },
        {
          inventory_id: null,
          status_id: DocPackageStatus.INNER_INVENTORY_SIGN,
        },
      );

      await manager.update(InventoryEntity, id, { del: true });
    });

    return true;
  }

  async signInventory(id: number, sign: string, emp: number): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      relations: { FileBlock: { FileVersionMain: true } },
      where: { id, del: false, temp: false },
    });

    if (!inventory) {
      customError(this.ERR_MSG_INVENTORY_NOT_FOUND);
    }

    if (![
      InventoryStatus.IN_PROGRESS,
      InventoryStatus.SIGNED,
    ].includes(inventory.status_id)) {
      customError(this.ERR_MSG_INVENTORY_STATUS);
    }

    const file = await (await inventory?.FileBlock)?.FileVersionMain;
    if (!file?.FileItemMain?.volume) customError("Не найден документ описи, id описи: " + id);

    const fileItemEntity = file.FileItemMain;

    let affected;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Добавляем подпись
      const signItem = await signAddUtil({
        manager: queryRunner.manager,
        sign,
        emp_id: emp,
        file_item_id: fileItemEntity.id,
      });

      // Меняем статус описи
      affected = await queryRunner.manager.update(InventoryEntity, { id }, {
        status_id: InventoryStatus.SIGNED,
      });

      // Удаляем старые подписи
      await queryRunner.manager.delete(SignEntity, {
        id: Not(signItem.id),
        file_item_id: fileItemEntity.id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customError(error.message);
    } finally {
      await queryRunner.release();
    }

    return !!affected;
  }
}
