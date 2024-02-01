import "dotenv/config";

import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from "typeorm";

import { globalSearchBuilderSmdoPackages } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { SmdoAbonentsEntity } from "../../entity/#organization/smdo/smdo_abonents.entity";
import { SmdoPackagesEntity } from "../../entity/#organization/smdo/smdo_packages.entity";
import { SmdoPackagesReceiversEntity } from "../../entity/#organization/smdo/smdo_packages_receivers.entity";
import { wLogger } from "../../modules/logger/logging.module";
import { listPaginationData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { SmdoService } from "../smdo.service";
import { GetPackagesArgs } from "./dto/get-packages.args";
import { OrderPackagesInput } from "./dto/order-packages-request.dto";
import { PaginatedPackagesResponse } from "./dto/paginated-packages-response.dto";

@Injectable()
export class PackagesService {
  private readonly packagesRepository: Repository<SmdoPackagesEntity>;
  private readonly receiversRepository: Repository<SmdoPackagesReceiversEntity>;
  private readonly smdoAbonentRepository: Repository<SmdoAbonentsEntity>;

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    this.packagesRepository = dataSource.getRepository(SmdoPackagesEntity);
    this.receiversRepository = dataSource.getRepository(SmdoPackagesReceiversEntity);
    this.smdoAbonentRepository = dataSource.getRepository(SmdoAbonentsEntity);
  }

  async get(
    args: GetPackagesArgs,
    pagination: PaginationInput,
    order: OrderPackagesInput,
    searchField: string,
  ): Promise<PaginatedPackagesResponse> {
    let where = {};
    if (args.smdoParentId) {
      let treePackagesId = await this.getChildrenTree(args.smdoParentId);
      if (args.abonentSmdoId)
        treePackagesId = await this.filterIdsByAbonent(treePackagesId, args.abonentSmdoId);
      delete args.smdoParentId;
      delete args.abonentSmdoId;

      where = { ...where, id: In(treePackagesId) };
    }
    if (args.docId) {
      let treePackagesId = await this.getPackagesByDocChildrenTree(args.docId);
      if (args.abonentSmdoId) {
        treePackagesId = await this.filterIdsByAbonent(treePackagesId, args.abonentSmdoId);
      }
      delete args.docId;
      delete args.abonentSmdoId;

      where = { ...where, id: In(treePackagesId) };
    }
    if (searchField?.trim()) {
      const queryBuilder = this.packagesRepository.createQueryBuilder("smdo_packages");
      const { pageNumber, pageSize, All } = pagination;
      await globalSearchBuilderSmdoPackages(queryBuilder, searchField);

      if (!All) {
        queryBuilder.skip((pageNumber - 1) * pageSize);
        queryBuilder.take(pageSize);
      }

      const [smdoPackages, total] = await queryBuilder.getManyAndCount();

      return paginatedResponseResult(smdoPackages, pageNumber, pageSize, total);
    }

    delete args?.searchField;
    return await listPaginationData({
      repository: this.packagesRepository,
      pagination: pagination,
      order: order ?? { id: "DESC" },
      filter: args,
      relations: { ToAbonent: true, FromAbonent: true, Receivers: { ToAbonent: true } },
      where,
    });
  }
  catch(e) {
    wLogger.error(e);
  }

  async filterIdsByAbonent(packagesId, abonentSmdoId) {
    const filteredIds = [];
    for (const packageSmdoId of packagesId) {
      const packageData = await this.packagesRepository.findOne({
        where: { id: packageSmdoId },
      });
      const receivers = await this.receiversRepository.find({
        where: { packageSmdoId: packageData.smdoId, abonentSmdoId },
      });
      if (
        receivers.length > 0 ||
        packageData?.toAbonentId === abonentSmdoId ||
        packageData?.fromAbonentId === abonentSmdoId
      )
        filteredIds.push(packageSmdoId);
    }
    return filteredIds;
  }

  async getPackagesByDocChildrenTree(docId: number): Promise<number[]> {
    const docPackages = await this.packagesRepository.find({ where: { docId } });
    let treeIdArray = [];

    for (const smdoPackage of docPackages)
      treeIdArray = treeIdArray.concat(await this.getChildrenTree(smdoPackage.smdoId));

    return treeIdArray;
  }

  async getChildrenTree(smdoParentId: string): Promise<number[]> {
    const parentPackage = await this.packagesRepository.findOne({
      where: { smdoId: smdoParentId },
    });

    if (!parentPackage) {
      return null;
    }

    return this.buildTree(parentPackage);
  }

  private async buildTree(smdoPackage: SmdoPackagesEntity): Promise<number[]> {
    const children = await this.packagesRepository.find({
      where: { smdoParentId: smdoPackage.smdoId },
    });

    const packageIds = [smdoPackage.id];
    if (children.length > 0) {
      const childPromises = children.map((child) => this.buildTree(child));
      const childPackageIds = await Promise.all(childPromises);
      packageIds.push(...[].concat(...childPackageIds));
    }

    return packageIds;
  }

  async deletePackageAndRefresh(packageId: string) {
    try {
      const smdoPackage = await this.packagesRepository.findOne({
        where: { smdoId: packageId },
      });
      if (!smdoPackage) throw new BadRequestException("Пакет с таким ID не найден");
      if (smdoPackage.type !== "Входящий")
        throw new BadRequestException("Повторное получение доступно только для входящих пакетов");
      await this.dataSource.transaction(async (manager) => {
        await manager.delete(SmdoPackagesEntity, { smdoId: smdoPackage.smdoId });
        await new SmdoService(this.dataSource).getPackageList();
      });
      return true;
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }
}
